# Plan: Free vs Paid Tier Gating for MealWise

**Context:** Gate existing features behind free/paid tiers. No new feature development — only enforce access control on features that already work. Tier lives on the `caretakers` table (the account/billing entity). A demo toggle allows switching tiers without billing integration.

---

## Phase 1: Backend Foundation

### 1.1 DB Migration — Add `subscription_tier` to `caretakers`
**File:** `backend/db.py` — in `_migrate_schema()`, add after the existing caretakers migrations (~line 299):
```python
_add_column_if_missing(conn, "caretakers", "subscription_tier", "TEXT NOT NULL DEFAULT 'free'")
```

### 1.2 Include tier in JWT + login response
**File:** `backend/security.py`
- Add `tier: str = "free"` param to `create_access_token()` (line 31)
- Add `"tier": tier` to the JWT payload dict (line 36)

**File:** `backend/routers/auth.py` — in `login()` (line 204):
- After fetching user row, query caretaker tier
- Pass `tier=tier` to `create_access_token()`
- Add `"tier": tier` to the login response dict

### 1.3 Create `require_paid_tier` dependency
**File:** `backend/security.py` — add new function that queries DB for caretaker tier.
Always queries DB (never stale). Missing caretaker = free.

---

## Phase 2: Gate Backend Endpoints

### 2.1 Auto-fill — hard block for free
**File:** `backend/routers/mealplan.py` — `autofill_plan()`
- Add `Depends(require_paid_tier)` to function params

### 2.2 Nutrient thresholds — block save, allow read
**File:** `backend/routers/thresholds.py` — `save_thresholds()`
- Add `Depends(require_paid_tier)` to function params
- GET endpoint stays open

### 2.3 Dish recommendations — limit to top 5 for free
**File:** `backend/routers/dishes.py` — `recommend_dishes()`
- After sorting, if free tier: `scored = scored[:5]`
- Add `"tier"` to response

### 2.4 Diner limit — free gets 1 diner only
**File:** `backend/routers/users.py` — profile creation
- Before inserting family_member, check count. If free and >= 1: raise 403

### 2.5 Demo tier toggle endpoint
**File:** `backend/routers/caretakers.py`
- New `PUT /{caretaker_id}/tier` endpoint
- Update existing GET endpoints to include `subscription_tier` in response

---

## Phase 3: Frontend Tier Awareness

### 3.1 API layer
**File:** `frontend/src/services/api.js` — Add `updateTier()` function

### 3.2 App-level tier state
**File:** `frontend/src/components/App.jsx`
- Add `userTier` state, set from caretaker response
- Pass as prop to child components

### 3.3 UpgradePromptModal component
**New file:** `frontend/src/components/UpgradePromptModal.jsx`
- Simple modal with feature name and close button

### 3.4 Gate CalendarScreen buttons
**File:** `frontend/src/components/CalendarScreen.jsx`
- Auto-fill, Threshold buttons: If free → lock icon + UpgradePromptModal

### 3.5 Gate DinerDashboard
**File:** `frontend/src/components/DinerDashboard.jsx`
- If free and diners >= 1: "Add Diner" opens UpgradePromptModal

### 3.6 Show recommendation limit banner
**File:** `frontend/src/components/AddDishModal.jsx`
- If free tier, show "Showing top 5. Upgrade for more."

### 3.7 Demo tier toggle in UI
- Small button to switch between free/paid for demo purposes

---

## Feature Gating Summary

| Feature | Free | Paid | Gate Type |
|---|---|---|---|
| Manual meal planning | Yes | Yes | None |
| Dish recommendations | Top 5 | Unlimited | Soft (limited results) |
| Auto-fill | Locked (visible) | Yes | Hard (403 + UI lock) |
| Threshold settings | Read only | Full CRUD | Hard (403 + UI lock) |
| Multi-diner | 1 diner | Unlimited | Hard (403 + UI lock) |
| Nutrition summary | View only | Full + warnings | Soft (strip warnings) |
| Shopping list | Yes | Yes | None (gate later) |
| Recipe viewing | Yes | Yes | None |

---

## Files Modified (10 files, 1 new)

**Backend (8 files):**
1. `backend/db.py` — add column migration
2. `backend/security.py` — tier in JWT + `require_paid_tier` dependency
3. `backend/routers/auth.py` — tier in login response
4. `backend/routers/mealplan.py` — gate autofill
5. `backend/routers/thresholds.py` — gate threshold save
6. `backend/routers/dishes.py` — limit recommendations for free
7. `backend/routers/users.py` — enforce 1-diner limit for free
8. `backend/routers/caretakers.py` — demo toggle endpoint + tier in responses

**Frontend (5 files, 1 new):**
1. `frontend/src/services/api.js` — updateTier API call
2. `frontend/src/components/App.jsx` — userTier state
3. `frontend/src/components/CalendarScreen.jsx` — gate buttons
4. `frontend/src/components/DinerDashboard.jsx` — gate add diner
5. `frontend/src/components/AddDishModal.jsx` — recommendation limit banner
6. `frontend/src/components/UpgradePromptModal.jsx` — **NEW** upgrade modal

---

## Verification
1. Login → verify tier="free" in response
2. Try auto-fill → should see 403 / locked UI
3. Use demo toggle to switch to "paid"
4. Try auto-fill again → should work
5. Switch back to "free" → add 2nd diner should be blocked
