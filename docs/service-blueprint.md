# Healthy Meal Planner — Technical Service Blueprint

> **Standard:** Nielsen Norman Group (NNG) Technical Service Blueprint
> **Audience:** Engineering, Architecture, QA, Product — internal technical reference
> **Maintained by:** Solution Architecture
> **Last updated:** 2026-03-21

---

## Table of Contents

1. [Blueprint Conventions](#1-blueprint-conventions)
2. [Cross-Cutting Concerns](#2-cross-cutting-concerns)
3. [Journey 1 — User Registration (OTP Flow)](#3-journey-1--user-registration-otp-flow)
4. [Journey 2 — User Login](#4-journey-2--user-login)
5. [Journey 3 — Caretaker & Family Member Setup](#5-journey-3--caretaker--family-member-setup)
6. [Journey 4 — Profile Onboarding & Edit](#6-journey-4--profile-onboarding--edit)
7. [Journey 5 — Meal Plan Browsing & Navigation](#7-journey-5--meal-plan-browsing--navigation)
8. [Journey 6 — Dish Discovery & Search](#8-journey-6--dish-discovery--search)
9. [Journey 7 — Meal Recommendation (Rule-Based Scorer)](#9-journey-7--meal-recommendation-rule-based-scorer)
10. [Journey 8 — Manual Meal Planning (Add / Remove Dish)](#10-journey-8--manual-meal-planning-add--remove-dish)
11. [Journey 9 — AI Plan Generation ("Plan with AI")](#11-journey-9--ai-plan-generation-plan-with-ai)
12. [Journey 10 — Premium Auto-fill Week](#12-journey-10--premium-auto-fill-week)
13. [Journey 11 — Shopping List Management](#13-journey-11--shopping-list-management)
14. [Journey 12 — Favourites Management](#14-journey-12--favourites-management)
15. [Journey 13 — Nutrient Tracking & Thresholds](#15-journey-13--nutrient-tracking--thresholds)
16. [Journey 14 — Premium Upgrade](#16-journey-14--premium-upgrade)
17. [Journey 15 — Account & Data Management](#17-journey-15--account--data-management)
18. [Data Dictionary](#18-data-dictionary)
19. [Service Dependency Map](#19-service-dependency-map)
20. [Constants & Configuration Reference](#20-constants--configuration-reference)

---

## 1. Blueprint Conventions

### 1.1 Swim Lane Legend

| Lane | Symbol | Description |
|------|--------|-------------|
| **User Actions** | 👤 | Physical steps the user takes — tap, type, swipe, navigate |
| **Frontend Components** | 🖥️ | React screen or component rendered; local state mutations; localStorage reads/writes |
| ─── *Line of Visibility* ─── | `···` | Above = visible to user. Below = invisible backend. |
| **API Contract** | 🔌 | HTTP method, URL path, request body schema, response schema, HTTP status codes |
| **Backend Services** | ⚙️ | FastAPI router handler → service function → algorithm; business rules applied |
| ─── *Line of Internal Interaction* ─── | `---` | Above = application logic. Below = persistence layer. |
| **Database Objects** | 🗄️ | Table(s) read or written; SQL operation type; indexes used; data returned |

### 1.2 Data Flow Notation

- **→** Data passed downstream (request)
- **←** Data returned upstream (response)
- **[R]** Read operation
- **[W]** Write / upsert operation
- **[D]** Delete operation
- **[PAID]** Requires `caretakers.subscription_tier = 'paid'`
- **[GATE]** Frontend tier-check before API call
- **[LOCK]** Slot is time-locked — past date or past meal cutoff

### 1.3 User ID Formats

| Format | Meaning |
|--------|---------|
| `<uuid>` | Regular user — `users.id` |
| `fm:<bigint>` | Family member — `family_members.id` prefixed with `fm:` |

Both formats are accepted interchangeably across all meal plan, shopping, and nutrient endpoints.

### 1.4 Week Addressing

All weekly data is keyed by `week_start` — an ISO date string (`YYYY-MM-DD`) representing the Monday of that week. Day slots are addressed as `day_index` 0–6 (Monday = 0, Sunday = 6).

---

## 2. Cross-Cutting Concerns

### 2.1 Authentication — JWT Flow

```
Client                        Backend
  │                              │
  │── POST /auth/login ─────────►│
  │                              │ verify password hash (SHA-256)
  │                              │ sign JWT {sub, email, tier, iat, exp}
  │◄── {token, tier} ────────────│
  │                              │
  │ store → localStorage         │
  │   mealwise_auth_token        │
  │   mealwise_auth_user         │
  │   mealwise_caretaker         │
  │                              │
  │── Any subsequent request ───►│
  │   Authorization: Bearer <t>  │ decode & verify HMAC-SHA256
  │                              │ extract auth_user_id → request.state.auth
  │◄── 401 if invalid/expired ───│
  │                              │
  │ on 401: clear localStorage   │
  │         reload page          │
```

**JWT Payload fields:** `sub` (auth_user_id), `email`, `tier`, `iat`, `exp`
**Algorithm:** HS256
**Secret:** `JWT_SECRET` env var (required; no hardcoded fallback)
**Expiry:** Configurable; default 1440 min (24 h)

### 2.2 Subscription Tier Gating

```
Frontend [GATE]                  Backend [PAID]
  │                                   │
  │ read tier from localStorage       │
  │ if tier !== 'paid':               │
  │   show UpgradePromptModal         │
  │   abort API call                  │
  │                                   │
  │ if tier === 'paid':               │
  │── API call ──────────────────────►│
  │                                   │ Depends(require_paid_tier)
  │                                   │   SELECT subscription_tier
  │                                   │   FROM caretakers
  │                                   │   WHERE auth_user_id = ?
  │                                   │ if tier != 'paid': raise 403
  │◄── 403 Forbidden if not paid ─────│
```

**Paid-only endpoints:**
- `POST /mealplan/{user_id}/autofill/validate`
- `POST /mealplan/{user_id}/autofill`
- `PUT /thresholds/{user_id}`

**Free-tier soft limits (not hard-blocked, enforced in service logic):**
- Max 1 family member (diner)
- Dish recommendations capped at 5 results

### 2.3 Slot Locking (Time-Based)

Meal slots are locked (read-only) once they are in the past. The lock is enforced independently on frontend (UI disables controls) and backend (expired slots excluded from shopping list).

| Meal Type | Cutoff Time | Logic |
|-----------|-------------|-------|
| Breakfast | 10:00 local | `now.hour >= 10` on today's date |
| Lunch | 14:00 local | `now.hour >= 14` on today's date |
| Dinner | 20:00 local | `now.hour >= 20` on today's date |
| Any slot | Past date | `slot_date < today` |

Implemented in: `backend/services/shopping_list_generator.py → is_slot_expired()`

### 2.4 Error State Catalogue

| HTTP Code | Condition | Frontend Behaviour |
|-----------|-----------|-------------------|
| 400 | Invalid request body / missing required fields | Show inline validation error |
| 401 | JWT missing, invalid, or expired | Clear localStorage → reload |
| 403 | Tier gate — paid feature accessed by free user | Show UpgradePromptModal |
| 404 | Resource not found (dish, user, plan) | Show empty state / toast |
| 409 | Conflict (e.g. duplicate email on register) | Show "email already registered" |
| 422 | FastAPI validation error | Log + show generic error |
| 500 | Unhandled server error | Show retry / generic error toast |

### 2.5 Local Storage Objects

| Key | Contents | Set by |
|-----|----------|--------|
| `mealwise_auth_token` | Raw JWT string | Login / Register |
| `mealwise_auth_user` | `{userId, email, name, tier}` JSON | Login / Register |
| `mealwise_caretaker` | `{caretakerId, name, tier}` JSON | Caretaker setup |
| `shop_checked_<userId>_<weekStart>_<range>` | JSON array of checked ingredient names | ShoppingScreen |

---

## 3. Journey 1 — User Registration (OTP Flow)

**Scenario:** A new user opens the app, enters their email, verifies an OTP code, then sets a password.

### Swimlane Table

| Lane | Step 1 — Open App | Step 2 — Enter Email | Step 3 — Submit Email | Step 4 — Enter OTP | Step 5 — Verify OTP | Step 6 — Set Password | Step 7 — Register |
|------|------------------|---------------------|----------------------|-------------------|--------------------|-----------------------|-------------------|
| 👤 **User Actions** | Opens browser / app URL | Types email address | Taps "Send OTP" | Receives OTP (console/email), types 6 digits | Taps "Verify" | Types password (×2 for confirm) | Taps "Create account" |
| 🖥️ **Frontend Components** | `AuthScreen.jsx` renders; tab = "register"; local state: `{email:'', otp:'', step:'email'}` | Controlled input updates `email` state | Button calls `requestOtp(email)` | `step` transitions to `'otp'`; OTP input renders | Calls `verifyOtp(email, otp)` | `step` → `'password'`; password inputs render | Calls `registerWithOtp(email, verificationToken, password)` |
| ···*Line of Visibility*··· | | | | | | | |
| 🔌 **API Contract** | — | — | `POST /auth/request-otp` → `{email}` ← `{success:true, delivery:"console"}` | — | `POST /auth/verify-otp` → `{email, otp}` ← `{success:true, verificationToken:"<uuid>"}` | — | `POST /auth/register` → `{email, verificationToken, password}` ← `{authUserId, email, name, emailVerifiedAt}` |
| ⚙️ **Backend Services** | — | — | `auth.request_otp()`: generate 6-digit OTP; compute expiry = now+10min; upsert `email_otps`; log OTP to console | — | `auth.verify_otp()`: fetch OTP row; check not expired & code matches; generate `verification_token` UUID; update row | — | `auth.register()`: fetch OTP row; validate `verificationToken`; check password complexity (8+ chars, uppercase, digit, special); hash password SHA-256; INSERT user; mark OTP consumed |
| `---`*Line of Internal Interaction*`---` | | | | | | | |
| 🗄️ **Database Objects** | — | — | **[W]** `email_otps` UPSERT `(email, otp_code, expires_at, created_at)` | — | **[R]** `email_otps` WHERE `email=?`; **[W]** `email_otps` SET `verified_at`, `verification_token` | — | **[R]** `email_otps` WHERE `email=?`; **[W]** `users` INSERT `(id, email, password_hash, email_verified_at, name, conditions, diet, allergies)`; **[W]** `email_otps` SET `consumed_at` |

### Post-conditions
- `users` row created with blank profile fields (name = 'Diner', conditions = `[]`, diet = 'none')
- User is NOT logged in yet — registration does not issue a JWT
- Frontend transitions to Login flow after success

### Failure Points
| Step | Failure | Response |
|------|---------|----------|
| 3 | Email already registered | `409 Conflict` |
| 5 | OTP expired (>10 min) | `400 Bad Request` — "OTP expired" |
| 5 | OTP mismatch | `400 Bad Request` — "Invalid OTP" |
| 7 | Weak password | `400 Bad Request` — password rule message |
| 7 | Token already consumed | `400 Bad Request` — "Token already used" |

---

## 4. Journey 2 — User Login

**Scenario:** A returning user enters credentials and gains access.

### Swimlane Table

| Lane | Step 1 — Open Login Tab | Step 2 — Enter Credentials | Step 3 — Submit | Step 4 — Load Caretaker | Step 5 — Route to App |
|------|------------------------|---------------------------|-----------------|------------------------|-----------------------|
| 👤 **User Actions** | Taps "Login" tab on AuthScreen | Types email + password | Taps "Sign in" | (Automatic) | Sees main app screen |
| 🖥️ **Frontend Components** | `AuthScreen.jsx` tab = `'login'`; local state `{email:'', password:''}` | Controlled inputs update state | Calls `login(email, password)` | On success: calls `getCaretakerByAuth(authUserId)`; stores `mealwise_caretaker`; calls `getDiners(caretakerId)` | Routes to `ProfilesScreen` or `TodayScreen` based on diner count |
| ···*Line of Visibility*··· | | | | | |
| 🔌 **API Contract** | — | — | `POST /auth/login` → `{email, password}` ← `{token, authUserId, email, name, tier}` | `GET /caretakers/by-auth/{authUserId}` ← `{caretakerId, name, tier}` then `GET /caretakers/{caretakerId}/diners` ← `[{userId, name, ...}]` | — |
| ⚙️ **Backend Services** | — | — | `auth.login()`: fetch user by email; hash input password SHA-256; compare hashes; sign JWT `{sub:authUserId, email, tier, iat, exp}`; load tier from caretakers | `caretakers.get_caretaker_by_auth()`: SELECT caretaker by auth_user_id. `caretakers.get_diners()`: SELECT family_members WHERE user_id = caretaker.auth_user_id | — |
| `---`*Line of Internal Interaction*`---` | | | | | |
| 🗄️ **Database Objects** | — | — | **[R]** `users` WHERE `email=?` → `{id, password_hash}`; **[R]** `caretakers` WHERE `auth_user_id=?` → `{subscription_tier}` | **[R]** `caretakers` WHERE `auth_user_id=?`; **[R]** `family_members` WHERE `user_id=?` ORDER BY `sort_order` | — |

### LocalStorage Written at Login
```
mealwise_auth_token  = "<jwt>"
mealwise_auth_user   = { userId, email, name, tier }
mealwise_caretaker   = { caretakerId, name, tier }
```

### Failure Points
| Failure | Response |
|---------|----------|
| Email not found | `401 Unauthorized` |
| Wrong password | `401 Unauthorized` |
| No caretaker record yet | Frontend creates caretaker via `POST /caretakers` (Journey 3, Step 1) |

---

## 5. Journey 3 — Caretaker & Family Member Setup

**Scenario:** A newly registered user creates their caretaker account, then adds one or more diners (family members / patients).

### Swimlane Table

| Lane | Step 1 — Create Caretaker | Step 2 — Open Profiles Screen | Step 3 — Add Diner | Step 4 — Fill Diner Profile | Step 5 — Save Diner | Step 6 — Switch Active Diner |
|------|--------------------------|-------------------------------|-------------------|----------------------------|--------------------|-----------------------------|
| 👤 **User Actions** | (Automatic post-login) | Views Profiles screen | Taps "Add diner" / "+" button | Fills name, age, sex, weight, conditions, diet, allergies | Taps "Save" | Taps diner avatar to set as active |
| 🖥️ **Frontend Components** | `App.jsx` detects missing caretaker; calls `createCaretaker()` | `ProfilesScreen.jsx` renders diner list; calls `getDiners()` on mount | Modal / inline form opens; `[GATE]` checks diner count ≤ limit for tier | Form state: `{name, age, sex, weightKg, conditions:[], diet:'none', allergies:[]}` | Calls `createOrUpdateProfile()` with `caretakerId` | Sets `activeDiner` in global state; stores to localStorage |
| ···*Line of Visibility*··· | | | | | | |
| 🔌 **API Contract** | `POST /caretakers` → `{name, authUserId}` ← `{caretakerId, name, tier}` | `GET /caretakers/{caretakerId}/diners` ← `[{userId, name, age, sex, ...}]` | — | — | `POST /users/profile` → `{name, age, sex, weightKg, caretakerId, conditions, diet, allergies}` ← `{userId, name, ...}` | — |
| ⚙️ **Backend Services** | `caretakers.create_caretaker()`: check if caretaker exists for authUserId (return existing); else INSERT caretaker; tier defaults to `'free'` | `caretakers.get_diners()`: SELECT family_members WHERE user_id = auth_user_id; map to profile dicts | — | — | `users.create_or_update_profile()`: if `userId` is None → generate UUID; INSERT family_members. If `userId` provided → UPDATE. Validate tier diner limit (free = 1, paid = 5). | — |
| `---`*Line of Internal Interaction*`---` | | | | | | |
| 🗄️ **Database Objects** | **[R]** `caretakers` WHERE `auth_user_id=?`; **[W]** `caretakers` INSERT `(id, name, auth_user_id, subscription_tier='free')` | **[R]** `family_members` WHERE `user_id=?` ORDER BY `sort_order` | — | — | **[R]** `family_members` COUNT WHERE `user_id=?` (tier limit check); **[W]** `family_members` INSERT or UPDATE `(user_id, caretaker_id, name, age, sex, weight_kg, conditions, dietary_prefs, allergies, sort_order)` | — |

### Diner Tier Limits

| Tier | Max Diners |
|------|-----------|
| `free` | 1 |
| `paid` | 5 |

When free-tier user tries to add a 2nd diner: backend returns `403`; frontend shows `UpgradePromptModal`.

---

## 6. Journey 4 — Profile Onboarding & Edit

**Scenario:** A new user (or existing user) fills out / edits their health profile — age, weight, conditions, dietary preference, allergies. This drives all recommendation and nutrient-target logic.

### Swimlane Table

| Lane | Step 1 — Open Onboarding | Step 2 — Enter Personal Data | Step 3 — Select Health Conditions | Step 4 — Select Diet | Step 5 — Select Allergies | Step 6 — Save Profile | Step 7 — Compute Targets |
|------|--------------------------|------------------------------|----------------------------------|--------------------|--------------------------|-----------------------|-------------------------|
| 👤 **User Actions** | First login routes to OnboardingScreen | Types name, age, weight; selects sex | Taps health condition chips (multi-select) | Taps diet option (single-select) | Taps allergen chips | Taps "Save" | (Automatic) |
| 🖥️ **Frontend Components** | `OnboardingScreen.jsx`; local state mirrors profile fields; `getProfile(userId)` on mount to pre-fill | Controlled inputs; age / weight parsed as numbers | Chip toggle: adds/removes from `conditions[]` | Radio buttons: sets `diet` string | Chip toggle: adds/removes from `allergies[]` | Calls `createOrUpdateProfile()` | Receives `recommendedCalories` etc. back; stores in state |
| ···*Line of Visibility*··· | | | | | | | |
| 🔌 **API Contract** | `GET /users/{userId}` ← `{name, age, sex, weightKg, conditions, diet, allergies, recommendedCalories, ...}` | — | — | — | — | `POST /users/profile` → `{userId, name, age, sex, weightKg, conditions, diet, allergies, caretakerId?}` ← `{userId, name, recommendedCalories, recommendedProtein, recommendedCarbs, recommendedFat}` | — |
| ⚙️ **Backend Services** | `users.get_profile()`: detect `fm:` prefix → query `family_members`; else query `users`. Return unified profile dict. | — | — | — | — | `users.create_or_update_profile()`: upsert user or family_member; call `recommend_targets(age, sex, weight_kg, diet)` → match closest profile from `Personalized_Diet_Recommendations.csv`; compute recommended macro targets; store back | — |
| `---`*Line of Internal Interaction*`---` | | | | | | | |
| 🗄️ **Database Objects** | **[R]** `users` or `family_members` by id | — | — | — | — | **[W]** `users` or `family_members` UPDATE `(name, age, sex, weight_kg, conditions, diet, allergies, recommended_calories, recommended_protein, recommended_carbs, recommended_fat)` | — |

### Profile-Driven Downstream Effects

| Profile Field | Used By |
|---------------|---------|
| `conditions` | Recommendation filtering, autofill nutrient targets, dish warning generation |
| `diet` | Dish filtering (vegetarian / vegan / low_carb / keto) |
| `allergies` | Dish filtering (exclude allergens) |
| `recommended_calories/protein/carbs/fat` | Solver objective, nutrient tracker RDA baseline |
| `age`, `sex`, `weight_kg` | Closest-match profile lookup for RDA targets |

---

## 7. Journey 5 — Meal Plan Browsing & Navigation

**Scenario:** User opens the Today screen, browses their weekly plan, navigates between days and weeks.

### Swimlane Table

| Lane | Step 1 — Open Today Screen | Step 2 — View Current Day | Step 3 — Tap Another Day | Step 4 — Navigate Previous/Next Week | Step 5 — View Daily Nutrients |
|------|--------------------------|--------------------------|--------------------------|-------------------------------------|------------------------------|
| 👤 **User Actions** | Taps "Today" tab | Sees meal slots for today | Taps day pill in DayStrip | Taps ‹ / › week navigation arrow | Taps nutrition section / chart |
| 🖥️ **Frontend Components** | `TodayScreen.jsx` mounts; computes `weekStart` from current date; calls `getMealPlan()` and `getFavourites()` | Renders meal slots for `dayIndex = today`; `MealCard` per entry; `EmptySlot` for empty slots | Updates `selectedDay` state; re-renders meal columns | `weekOffset` state ±1; recomputes `weekStart`; re-calls `getMealPlan()` | `NutritionPanel.jsx` opens; calls `getDayNutrients()` |
| ···*Line of Visibility*··· | | | | | |
| 🔌 **API Contract** | `GET /mealplan/{userId}?weekStart=<date>` ← `{[dayIndex]: {[mealType]: [{entryId, dishId, name, servings, ...}]}}` | — | — | `GET /mealplan/{userId}?weekStart=<newDate>` (same shape) | `GET /mealplan/{userId}/nutrients/day/{dayIndex}?weekStart=<date>` ← `{calories, protein, carbs, fat, fiber, sodium, ...}` |
| ⚙️ **Backend Services** | `mealplan.get_meal_plan()`: SELECT meal_plans JOIN recipes WHERE user_id=? AND week_start=?; group by day_index → meal_type → entries list | — | — | Same handler, different `week_start` | `mealplan.get_daily_nutrients()`: SELECT meal_plans for day; join ingredients; sum nutrients × servings |
| `---`*Line of Internal Interaction*`---` | | | | | |
| 🗄️ **Database Objects** | **[R]** `meal_plans` JOIN `recipes` ON dish_id WHERE `user_id=? AND week_start=?` ORDER BY `entry_order`; uses idx_meal_plans_user | — | — | **[R]** same query, new `week_start` | **[R]** `meal_plans` WHERE `user_id=? AND week_start=? AND day_index=?`; **[R]** `recipes` for nutrients; **[R]** `ingredients` for detailed macros |

---

## 8. Journey 6 — Dish Discovery & Search

**Scenario:** User opens Discover screen to browse or search all available dishes, applying filters.

### Swimlane Table

| Lane | Step 1 — Open Discover | Step 2 — View All Dishes | Step 3 — Search | Step 4 — Apply Diet Filter | Step 5 — Apply Allergy Filter | Step 6 — Apply Health Condition Filter | Step 7 — View Dish Detail |
|------|------------------------|--------------------------|----------------|---------------------------|------------------------------|---------------------------------------|--------------------------|
| 👤 **User Actions** | Taps "Discover" tab | Scrolls list of dishes | Types in search box | Taps diet chip | Taps allergen chip | Taps condition chip | Taps a dish card |
| 🖥️ **Frontend Components** | `DiscoverScreen.jsx` mounts; local state `{search:'', filterDiet:[], filterAllergies:[], filterConditions:[]}` | Calls `getRecommendedDishes()` with current filters | Debounced: updates `search` state → re-fetches | Toggles `filterDiet` → re-fetches | Toggles `filterAllergies` → re-fetches | Toggles `filterConditions` → re-fetches | Modal or detail panel opens; calls `getDishDetail(dishId)` |
| ···*Line of Visibility*··· | | | | | | | |
| 🔌 **API Contract** | `GET /dishes/recommend/{userId}?filterMealType=&filterDiet=&filterAllergies=&filterConditions=&search=&weekStart=` ← `[{dishId, name, score, warnings, nutrients, ...}]` | Same | Same + `search=<text>` | Same + `filterDiet=<value>` | Same + `filterAllergies=<csv>` | Same + `filterConditions=<csv>` | `GET /dishes/{dishId}` ← `{name, description, ingredients, instructions, nutrients, imageUrl, ...}` |
| ⚙️ **Backend Services** | `dishes.recommend_dishes()`: load user profile; load all recipes; call `filter_dishes()` then `score_dish()` per recipe; sort by score desc; cap at 5 if free tier | — | `filter_dishes()` adds `search` text match on name / ingredients / keywords | `filter_dishes()` checks `is_vegetarian`, `is_vegan`, `is_low_carb`, `is_keto`, etc. | `filter_dishes()` excludes dishes where allergen present in `allergies` JSON | `filter_dishes()` excludes dishes where condition maps to "avoid" category | `dishes.get_dish_detail()`: SELECT recipe + parse ingredients JSON + parse steps JSON |
| `---`*Line of Internal Interaction*`---` | | | | | | | |
| 🗄️ **Database Objects** | **[R]** `users` or `family_members` for profile; **[R]** `recipes` ALL (full table scan, no pagination); **[R]** `favourites` WHERE `user_id=?` | — | — | — | — | — | **[R]** `recipes` WHERE `id=?` |

### Scoring Algorithm (Rule-Based)

`score_dish()` in `backend/services/recommendation_engine.py`:

| Component | Max Points | Logic |
|-----------|-----------|-------|
| Health Score | 70 | Deduct for each condition conflict: cholesterol recipe + cholesterol condition → −20; diabetes + high sugar → −20; hypertension + high sodium → −20; etc. |
| Nutrient Score | 30 | Reward matching remaining daily deficit: protein, fiber, calories, sodium, cholesterol, sugar gaps from `day_entries` |
| Preference Score | 10 | +5 if in favourites; +3 if matches meal type; −5 if already appears in week; −3 if same dish today |
| **Total** | **110** | Sorted desc; ties broken by recipe index |

---

## 9. Journey 7 — Meal Recommendation (Rule-Based Scorer)

**Scenario:** User views an empty meal slot — the app auto-loads ranked dish suggestions for that specific slot context (day, meal type, nutrient state).

### Swimlane Table

| Lane | Step 1 — View Empty Slot | Step 2 — Suggestions Load | Step 3 — See Warnings | Step 4 — Select Suggestion | Step 5 — Add to Plan |
|------|--------------------------|--------------------------|----------------------|--------------------------|---------------------|
| 👤 **User Actions** | Lands on day with empty meal slot | Waits ~500 ms | Reads health warning badges | Taps suggested dish | Dish added to slot |
| 🖥️ **Frontend Components** | `TodayScreen.jsx` renders `EmptySlot` component for slot; on mount: calls `getRecommendedDishes()` with `{day:dayIndex, mealType, weekStart}` | Renders ranked dish cards inside EmptySlot with score badges | Warning chips rendered per dish (e.g., "High sodium — watch for Hypertension") | Calls `addDishToPlan()` | Slot re-renders as `MealCard`; nutrient bar updates |
| ···*Line of Visibility*··· | | | | | |
| 🔌 **API Contract** | `GET /dishes/recommend/{userId}?day=<n>&mealType=<type>&weekStart=<date>` ← `[{dishId, name, score, warnings:[{type, message}], nutrients}]` (max 5 if free) | — | — | `POST /mealplan/{userId}/add` → `{dayIndex, mealType, dishId, servings:1, weekStart}` ← `{entryId, dayIndex, mealType, dishId, ...}` | — |
| ⚙️ **Backend Services** | `dishes.recommend_dishes()`: load profile + conditions; call `filter_dishes(meal_type=mealType)`; call `score_dish()` for each; call `get_warnings()` for top results; slice to 5 if free tier | — | `get_warnings()`: compare dish nutrients against condition thresholds (Hypertension → sodium > 600mg → warn; Diabetes → sugar > 20g → warn; Cholesterol → saturated fat > 5g → warn; Gout → purine-rich foods → warn) | — | `mealplan.add_dish_to_plan()`: INSERT meal_plans |
| `---`*Line of Internal Interaction*`---` | | | | | |
| 🗄️ **Database Objects** | **[R]** `users`/`family_members` (profile + conditions); **[R]** `recipes` (filtered); **[R]** `meal_plans` WHERE `user_id=? AND week_start=?` (for repeat detection); **[R]** `favourites` WHERE `user_id=?` | — | — | — | **[W]** `meal_plans` INSERT `(user_id, week_start, day_index, meal_type, dish_id, servings, entry_order)` |

---

## 10. Journey 8 — Manual Meal Planning (Add / Remove Dish)

**Scenario:** User explicitly selects a dish from Discover and places it in a specific meal slot, or removes an existing dish.

### 10.1 Add Dish Swimlane

| Lane | Step 1 — Open Meal Selector | Step 2 — Pick Day & Meal Type | Step 3 — Confirm Add | Step 4 — Plan Updates |
|------|----------------------------|------------------------------|---------------------|----------------------|
| 👤 **User Actions** | Taps dish card → "Add to plan" | Selects day and meal type from dropdown | Taps "Add" | Sees dish appear in plan |
| 🖥️ **Frontend Components** | `DiscoverScreen.jsx` or `TodayScreen.jsx`; meal selector modal; local state `{selectedDay, selectedMealType, selectedServings:1}` | UI controls update state | Calls `addDishToPlan(userId, {dayIndex, mealType, dishId, servings, weekStart})` | Refetches `getMealPlan()` or updates local cache; `NutritionPanel` re-renders |
| ···*Line of Visibility*··· | | | | |
| 🔌 **API Contract** | — | — | `POST /mealplan/{userId}/add` → `{dayIndex, mealType, dishId, servings, weekStart, customIngredients?}` ← `{entryId, dayIndex, mealType, dishId, name, servings, nutrients}` | — |
| ⚙️ **Backend Services** | — | — | `mealplan.add_dish_to_plan()`: validate dish exists; check slot not locked; compute `entry_order` (max existing + 1); INSERT meal_plans | — |
| `---`*Line of Internal Interaction*`---` | | | | |
| 🗄️ **Database Objects** | — | — | **[R]** `recipes` WHERE `id=?` (validate dish); **[R]** `meal_plans` MAX `entry_order` WHERE slot; **[W]** `meal_plans` INSERT | — |

### 10.2 Remove Dish Swimlane

| Lane | Step 1 — Swipe / Tap Remove | Step 2 — Confirm | Step 3 — Plan Updates |
|------|-----------------------------|------------------|-----------------------|
| 👤 **User Actions** | Taps ✕ or swipe on MealCard | (Optional confirm) | Dish removed from slot |
| 🖥️ **Frontend Components** | `MealCard.jsx` remove button; calls `removeDishFromPlan(userId, entryId)` | — | Optimistic update: removes card from local state; refetches plan |
| ···*Line of Visibility*··· | | | |
| 🔌 **API Contract** | `DELETE /mealplan/{userId}/remove/{entryId}` ← `{success:true}` | — | — |
| ⚙️ **Backend Services** | `mealplan.remove_dish_from_plan()`: validate entry belongs to user; check slot not [LOCK]ed; DELETE row | — | — |
| `---`*Line of Internal Interaction*`---` | | | |
| 🗄️ **Database Objects** | **[R]** `meal_plans` WHERE `id=?` (ownership check); **[D]** `meal_plans` DELETE WHERE `id=?` | — | — |

---

## 11. Journey 9 — AI Plan Generation ("Plan with AI")

**Scenario:** User taps "Plan with AI" on an empty week. The app calls the OR-Tools CP solver 7 times (once per day) to fill the entire week.

### Swimlane Table

| Lane | Step 1 — Tap "Plan with AI" | Step 2 — Per-Day Loop (×7) | Step 3 — Solver Executes | Step 4 — Results Saved | Step 5 — Plan Displayed |
|------|----------------------------|---------------------------|--------------------------|------------------------|------------------------|
| 👤 **User Actions** | Taps "Plan with AI" button (visible when week is empty) | (Automatic — progress indicator) | Waits 3–30 s per day | (Automatic) | Sees fully populated week |
| 🖥️ **Frontend Components** | `TodayScreen.jsx` → `handleGeneratePlan()`; sets `isGenerating=true`; shows loading overlay; loops `dayIndex` 0→6 | For each day: calls `generateMealPlan(userId, {weekStart, numDays:1, dayIndex})` | Awaits response | Accumulates returned entries; updates plan state | `setIsGenerating(false)`; refetches `getMealPlan()`; renders all 7 days |
| ···*Line of Visibility*··· | | | | | |
| 🔌 **API Contract** | — | `POST /mealplan/{userId}/generate` → `{weekStart, numDays:1, timeLimitSeconds:10, dayIndex}` ← `{plan:{[dayIndex]:{[mealType]:[{dishId, name, servings}]}}, objective_score}` | — | — | — |
| ⚙️ **Backend Services** | — | `mealplan.generate_meal_plan()`: load user profile; call `generate_meal_plan_for_week()`; build `SolverConfig`; call `build_solver_inputs()`; call `solve_meal_plan()`; persist results via batch INSERT | `solve_meal_plan()` (OR-Tools CP-SAT): create binary vars `x[day,meal,recipe]`; create integer vars `servings[day,meal,recipe]`; add constraints; set weighted objective; call `solver.Solve()` with time limit | On solve success: INSERT all selected (day, meal, recipe, servings) into `meal_plans` | — |
| `---`*Line of Internal Interaction*`---` | | | | | |
| 🗄️ **Database Objects** | — | **[R]** `users`/`family_members` (profile); **[R]** `recipes` ALL (load candidates); **[R]** `favourites` (for boost weight); **[R]** `meal_plans` WHERE `user_id=? AND week_start=?` (existing, to detect repeats) | — | **[D]** `meal_plans` DELETE WHERE `user_id=? AND week_start=? AND day_index=?` (clear day first); **[W]** `meal_plans` INSERT batch (all solver-selected entries) | — |

### Solver Architecture Detail

```
generate_meal_plan_for_week()
    │
    ├── build_solver_inputs()          solver/inputs.py
    │     ├── load user profile (conditions, diet, allergies, targets)
    │     ├── SELECT all recipes
    │     ├── filter_candidates():
    │     │     ├── by meal_type (breakfast/lunch/dinner)
    │     │     ├── by diet flag (is_vegetarian, is_vegan, is_low_carb)
    │     │     ├── by allergies (exclude allergen-tagged recipes)
    │     │     ├── by conditions (exclude "avoid" category recipes)
    │     │     └── exclude condiments
    │     └── load favourites (for boost weight)
    │
    └── solve_meal_plan()              solver/core.py
          │
          ├── Decision Variables
          │     ├── x[day, meal, recipe]  → BoolVar (select or not)
          │     └── servings[day,meal,r]  → IntVar(1, 2)
          │
          ├── Hard Constraints
          │     ├── Exactly 1 recipe per meal slot
          │     ├── Serving bounds: 1 ≤ servings ≤ 2
          │     ├── ≥1 main course per lunch/dinner
          │     ├── ≤1 side dish per lunch/dinner
          │     └── Daily nutrient hard caps (if set)
          │
          └── Objective (minimise weighted sum)
                ├── Nutrient deviation    ×1,000
                ├── Nutrient over-limit   ×20,000
                ├── Fiber under-target    ×200
                ├── 3-day repeat          ×500,000
                ├── Same-day repeat       ×1,000,000
                ├── Full-week repeat      ×300,000
                ├── Meal ratio deviation  ×10
                ├── Satiety balance       ×2
                ├── Recipe variety        ×25,000
                ├── Random perturbation   ±500,000 (diversity)
                └── Favourite boost       −50,000 (negative = reward)
```

### Solver Config Defaults

| Parameter | Value |
|-----------|-------|
| `num_days` | 1 (called 7×) or 7 |
| `time_limit_seconds` | 10 per day |
| `max_recipes_per_meal` | 1–2 |
| `meal_calorie_ratio` | breakfast: 0.20, lunch: 0.45, dinner: 0.35 |
| `meal_satiety_ratio` | breakfast: 0.15, lunch: 0.50, dinner: 0.35 |
| `calorie_buffer_pct` | 0.10 (10% tolerance) |

---

## 12. Journey 10 — Premium Auto-fill Week

**Scenario:** A paid-tier user opens AutofillSettingsModal, configures per-meal nutrient caps, then triggers auto-fill which uses the OR-Tools solver to fill only the empty slots while honouring existing meals.

### Swimlane Table

| Lane | Step 1 — Tap "Auto-fill Week" [GATE] | Step 2 — Configure Settings | Step 3 — Validate Pre-flight | Step 4 — Run Autofill | Step 5 — Constraint Relaxation (if needed) | Step 6 — Results Applied |
|------|------------------------------------|----------------------------|------------------------------|----------------------|-------------------------------------------|--------------------------|
| 👤 **User Actions** | Taps "Auto-fill week" button | Sets max dishes/slot, per-meal cal/carb/fat caps; optionally sets nutrient thresholds | (Automatic — validation runs) | Taps "Autofill" | Reviews violation list; optionally ticks "Allow relaxation" | Sees empty slots populated; existing meals untouched |
| 🖥️ **Frontend Components** | `TodayScreen.jsx` → `handleAutofill()`; `[GATE]` checks tier; opens `AutofillSettingsModal.jsx` | Modal form: `maxDishesPerSlot`, `maxCaloriesPerMeal`, `maxCarbsPerMeal`, `maxFatPerMeal`; links to `ThresholdSettingsModal` | Calls `validateAutofillPlan()` | Calls `autofillPlan()` | If violations returned: shows list in modal; `allowConstraintRelaxation` toggle | Closes modal; refetches `getMealPlan()` |
| ···*Line of Visibility*··· | | | | | | |
| 🔌 **API Contract** | — | — | `POST /mealplan/{userId}/autofill/validate` [PAID] → `{weekStart, settings:{maxDishesPerSlot, maxCaloriesPerMeal, ...}, thresholds:{calories, protein, carbs, fat}}` ← `{valid:bool, violations:[{slot, type, message}]}` | `POST /mealplan/{userId}/autofill` [PAID] → `{weekStart, settings, thresholds, allowConstraintRelaxation:bool}` ← `{plan:{...}, objective_score, slots_filled}` | — | — |
| ⚙️ **Backend Services** | — | — | `mealplan.validate_autofill_plan()` [requires paid]: load existing meal_plans; for each existing slot: check `maxDishesPerSlot`; check nutrient caps per meal; check daily total; collect `AutofillConstraintViolation` objects | `mealplan.autofill_plan()` [requires paid]: load existing as `FixedMealAssignment[]`; build solver inputs (exclude fixed slots from variables); set `per_meal_nutrient_caps` from settings; call `solve_meal_plan(fixed_assignments=existing)` | Solver with `allowConstraintRelaxation=True`: relaxes per-meal caps for pre-existing meals only | Persist only newly-generated slots (INSERT); do not touch existing slots |
| `---`*Line of Internal Interaction*`---` | | | | | | |
| 🗄️ **Database Objects** | — | — | **[R]** `caretakers` (tier check); **[R]** `meal_plans` WHERE `user_id=? AND week_start=?`; **[R]** `recipes` (nutrients for validation) | **[R]** `caretakers` (tier check); **[R]** `meal_plans` (existing = fixed); **[R]** `recipes`; **[R]** `nutrient_thresholds` (user custom targets); **[R]** `favourites` | — | **[W]** `meal_plans` INSERT (new slots only); existing rows untouched |

### Violation Types

| Violation Type | Trigger |
|----------------|---------|
| `too_many_dishes` | Existing dishes in slot > `maxDishesPerSlot` |
| `wrong_meal_type` | Dish not appropriate for slot's meal type |
| `missing_main_course` | Lunch/dinner slot has no main course |
| `calories_exceeded` | Slot calories > `maxCaloriesPerMeal` |
| `carbs_exceeded` | Slot carbs > `maxCarbsPerMeal` |
| `fat_exceeded` | Slot fat > `maxFatPerMeal` |
| `daily_target_exceeded` | Day total exceeds user's daily threshold |

---

## 13. Journey 11 — Shopping List Management

**Scenario:** User navigates to Shopping screen, selects which meal slots to shop for, views aggregated ingredient list, and ticks off items as they shop.

### Swimlane Table

| Lane | Step 1 — Open Shopping Screen | Step 2 — Select Range | Step 3 — Sync Selections | Step 4 — Toggle Individual Slot | Step 5 — View Ingredient List | Step 6 — Tick Off Items | Step 7 — Copy List |
|------|-------------------------------|----------------------|--------------------------|--------------------------------|-------------------------------|------------------------|-------------------|
| 👤 **User Actions** | Taps "Shopping" tab | Taps Today / 3 Days / This Week pill | (Automatic) | Taps meal slot checkbox | Scrolls ingredient list | Taps ingredient token to check it | Taps copy icon |
| 🖥️ **Frontend Components** | `ShoppingScreen.jsx` mounts; `range='week'`; calls `getMealPlan()` and `getShoppingList()` | Updates `range` state; `getRangeDays()` computes active day indices | Computes `desiredSelections` vs `existingSelections`; calls `toggleShoppingSelection()` for each diff | Calls `toggleShoppingSelection()` for that slot | Renders categorised `items` (proteins/grains/veg/fruits/dairy/pantry/other) via `categorise()`; `fmtQty()` formats grams (kg if ≥1000g) | Toggles `checked` Set in state; persists to localStorage key `shop_checked_<userId>_<weekStart>_<range>` | `navigator.clipboard.writeText()` with formatted text |
| ···*Line of Visibility*··· | | | | | | | |
| 🔌 **API Contract** | `GET /mealplan/{userId}?weekStart=` ← plan; `GET /shopping-list/{userId}?weekStart=` ← `{totalDishes, selections:[{dayIndex, mealType}], items:[{name, grams}]}` | — | `POST /shopping-list/{userId}/toggle-selection` → `{weekStart, dayIndex, mealType}` ← `{action:"added"|"removed", selections:[...]}` | Same toggle endpoint | `GET /shopping-list/{userId}?weekStart=` (re-fetch after sync) ← `{items:[{name, grams, category}]}` | — | — |
| ⚙️ **Backend Services** | `shopping_list.get_user_shopping_list()`: fetch selections; filter expired slots via `is_slot_expired()`; call `get_shopping_list()` | — | `shopping_list.toggle_shopping_selection()`: INSERT or DELETE `shopping_selections` row (upsert toggle logic) | Same | `get_shopping_list()`: JOIN `meal_plans` → `recipes`; parse `ingredients` JSON map; scale by servings; aggregate `{name: grams}` dict; return sorted list | — | — |
| `---`*Line of Internal Interaction*`---` | | | | | | | |
| 🗄️ **Database Objects** | **[R]** `meal_plans` (for plan); **[R]** `shopping_selections` WHERE `user_id=? AND week_start=?` | — | **[W]** `shopping_selections` INSERT or DELETE (UNIQUE constraint on user_id + week_start + day_index + meal_type) | Same | **[R]** `shopping_selections` (selected keys); **[R]** `meal_plans` WHERE selected; **[R]** `recipes` (ingredients JSON, servings) | — | — |

### Ingredient Aggregation Logic

```
For each selected, non-expired meal_plan slot:
  ingredients = custom_ingredients  OR  recipes.ingredients (JSON map {name: grams})

  if custom_ingredients exists:
    use as-is (user-overridden amounts)
  else:
    scale each ingredient: amount = base_grams × meal_plan.servings

  totals[ingredient_name] += amount

Return: [{name, grams}] sorted by name
```

### Shopping List Categorisation (Frontend)

| Category | Keywords matched in ingredient name |
|----------|-------------------------------------|
| `proteins` | chicken, beef, pork, fish, egg, tofu, beans, lentils, turkey, salmon, tuna |
| `grains` | rice, bread, pasta, flour, oat, cereal, wheat, barley, noodle |
| `vegetables` | carrot, spinach, broccoli, onion, garlic, tomato, pepper, cucumber, celery |
| `fruits` | apple, banana, berry, orange, lemon, mango, grape, strawberry |
| `dairy` | milk, cheese, butter, yogurt, cream, ghee |
| `pantry` | oil, salt, sugar, sauce, vinegar, spice, stock, broth |
| `other` | everything else |

---

## 14. Journey 12 — Favourites Management

**Scenario:** User stars a dish to save it as a favourite; starred dishes get a boost in AI recommendations.

### Swimlane Table

| Lane | Step 1 — View Dish | Step 2 — Star Dish | Step 3 — Un-star Dish | Step 4 — View Favourites |
|------|------------------|-------------------|-----------------------|--------------------------|
| 👤 **User Actions** | Views dish card in Discover | Taps star / heart icon | Taps again to un-star | (Favourites shown as pre-starred in Discover) |
| 🖥️ **Frontend Components** | `DiscoverScreen.jsx`; `favouriteIds` set loaded from `getFavourites()` on mount | Calls `addFavourite(userId, dishId)`; optimistically adds `dishId` to `favouriteIds` set | Calls `removeFavourite(userId, dishId)`; removes from set | Star icon rendered as filled/outlined based on `favouriteIds.has(dishId)` |
| ···*Line of Visibility*··· | | | | |
| 🔌 **API Contract** | `GET /favourites/{userId}` ← `{favourites:[{dishId, name}]}` | `POST /favourites/{userId}/{dishId}` ← `{success:true}` | `DELETE /favourites/{userId}/{dishId}` ← `{success:true}` | — |
| ⚙️ **Backend Services** | `favourites.get_favourites()`: SELECT all for user; join with recipes for names | `favourites.add_favourite()`: INSERT IGNORE (idempotent) | `favourites.remove_favourite()`: DELETE | — |
| `---`*Line of Internal Interaction*`---` | | | | |
| 🗄️ **Database Objects** | **[R]** `favourites` JOIN `recipes` WHERE `user_id=?` | **[W]** `favourites` INSERT `(user_id, dish_id)` ON CONFLICT DO NOTHING | **[D]** `favourites` DELETE WHERE `user_id=? AND dish_id=?` | — |

### Downstream Effect on Recommendations

Favourite dish IDs are passed into `score_dish()` → adds `+5 pts` to Preference Score. In solver: favourite recipes get `−50,000` weight on objective (negative = incentivises selection).

---

## 15. Journey 13 — Nutrient Tracking & Thresholds

**Scenario:** User views daily/weekly nutrient totals against recommended targets; paid users set custom thresholds.

### 15.1 View Nutrients Swimlane

| Lane | Step 1 — Open Nutrition Panel | Step 2 — View Day Breakdown | Step 3 — View Week Summary |
|------|------------------------------|-----------------------------|-----------------------------|
| 👤 **User Actions** | Taps nutrition section on Today screen | Reads bar chart per nutrient | Taps "Week" tab |
| 🖥️ **Frontend Components** | `NutritionPanel.jsx` opens; calls `getDayNutrients()` | `NutritionChart.jsx` renders bars; compares `actual` vs `threshold` (from `getThresholds()`); coloured red if exceeded | Calls `getWeekNutrients()` |
| ···*Line of Visibility*··· | | | |
| 🔌 **API Contract** | `GET /mealplan/{userId}/nutrients/day/{dayIndex}?weekStart=` ← `{calories, protein, carbs, fat, fiber, sodium, cholesterol, sugar}` | — | `GET /mealplan/{userId}/nutrients/week?weekStart=` ← `{[dayIndex]: {calories, protein, ...}}` |
| ⚙️ **Backend Services** | `mealplan.get_daily_nutrients()`: SELECT meal_plans for day; load ingredient cache; `get_day_nutrients()` sums nutrients × servings | — | `mealplan.get_weekly_nutrients()`: same for all 7 days |
| `---`*Line of Internal Interaction*`---` | | | |
| 🗄️ **Database Objects** | **[R]** `meal_plans` WHERE `day_index=?`; **[R]** `recipes` (nutrients columns); **[R]** `ingredients` (detailed macros) | — | **[R]** `meal_plans` WHERE `week_start=?`; **[R]** `recipes`; **[R]** `ingredients` |

### 15.2 Set Custom Thresholds Swimlane [PAID]

| Lane | Step 1 — Open Threshold Modal [GATE] | Step 2 — Load Available Nutrients | Step 3 — Adjust Values | Step 4 — Save |
|------|--------------------------------------|-----------------------------------|------------------------|---------------|
| 👤 **User Actions** | Taps threshold settings icon | Sees list of nutrients with RDA defaults | Drags slider / types value | Taps "Save" |
| 🖥️ **Frontend Components** | `ThresholdSettingsModal.jsx`; `[GATE]` tier check; calls `getAvailableNutrients()` and `getThresholds(userId)` | Renders sliders per nutrient with RDA default as placeholder | Updates local state `{nutrient_key: {daily_value, per_meal_value}}` | Calls `saveThresholds(userId, thresholds)` |
| ···*Line of Visibility*··· | | | | |
| 🔌 **API Contract** | `GET /thresholds/nutrients` ← `[{key, label, unit, rda_default}]` | `GET /thresholds/{userId}` ← `[{nutrientKey, dailyValue, perMealValue}]` | — | `PUT /thresholds/{userId}` [PAID] → `[{nutrientKey, dailyValue, perMealValue}]` ← `{success:true}` |
| ⚙️ **Backend Services** | `thresholds.get_available_nutrients()`: derive nutrient keys from recipes table schema | `thresholds.get_thresholds()`: SELECT all for user | — | `thresholds.save_thresholds()` [requires paid]: for each nutrient: UPSERT `nutrient_thresholds` |
| `---`*Line of Internal Interaction*`---` | | | | |
| 🗄️ **Database Objects** | **[R]** `information_schema.columns` WHERE `table_name='recipes'` for nutrient columns | **[R]** `nutrient_thresholds` WHERE `user_id=?` | — | **[R]** `caretakers` (tier check); **[W]** `nutrient_thresholds` UPSERT `(user_id, nutrient_key, daily_value, per_meal_value)` ON CONFLICT `(user_id, nutrient_key)` DO UPDATE |

### RDA Defaults

| Nutrient | RDA | Unit |
|----------|-----|------|
| Calories | 2,000 | kcal |
| Protein | 50 | g |
| Carbohydrates | 300 | g |
| Fat | 78 | g |
| Fiber | 25 | g |
| Sodium | 2,300 | mg |
| Cholesterol | 300 | mg |
| Sugar | 50 | g |

---

## 16. Journey 14 — Premium Upgrade

**Scenario:** A free-tier user encounters a paid feature gate and upgrades their account tier.

### Swimlane Table

| Lane | Step 1 — Hit Feature Gate | Step 2 — See Upgrade Prompt | Step 3 — Confirm Upgrade | Step 4 — Tier Updated |
|------|--------------------------|-----------------------------|--------------------------|-----------------------|
| 👤 **User Actions** | Taps "Auto-fill week" or "Set thresholds" or tries to add 2nd diner | Reads upgrade modal | Taps "Upgrade to Pro" | Returns to feature — now accessible |
| 🖥️ **Frontend Components** | `[GATE]` check: `tier !== 'paid'`; opens `UpgradePromptModal.jsx` | Modal displays benefits | Calls `updateTier(caretakerId, 'paid')` | Updates `mealwise_auth_user.tier = 'paid'`; updates `mealwise_caretaker.tier = 'paid'`; closes modal |
| ···*Line of Visibility*··· | | | | |
| 🔌 **API Contract** | — | — | `PUT /caretakers/{caretakerId}/tier` → `{tier:"paid"}` ← `{caretakerId, name, tier:"paid"}` | — |
| ⚙️ **Backend Services** | — | — | `caretakers.update_tier()`: validate tier value ∈ `{free, paid}`; UPDATE caretakers | — |
| `---`*Line of Internal Interaction*`---` | | | | |
| 🗄️ **Database Objects** | — | — | **[W]** `caretakers` UPDATE `subscription_tier = 'paid'` WHERE `id = ?` | — |

> **Note:** In the current implementation, tier update is open — no payment gateway is integrated. This is a placeholder for a future Stripe / payment provider integration point.

---

## 17. Journey 15 — Account & Data Management

### 17.1 Clear Week Plan Swimlane

| Lane | Step 1 — Tap "Clear Week" | Step 2 — Confirm | Step 3 — Week Cleared |
|------|--------------------------|------------------|-----------------------|
| 👤 **User Actions** | Taps "Clear all" / trash icon on week view | Confirms dialog | Sees empty week |
| 🖥️ **Frontend Components** | `TodayScreen.jsx`; calls `clearWeekMealPlan(userId, weekStart)` | — | Refetches plan; renders all empty slots |
| ···*Line of Visibility*··· | | | |
| 🔌 **API Contract** | `DELETE /mealplan/{userId}/clear?weekStart=` ← `{deleted:N}` | — | — |
| ⚙️ **Backend Services** | `mealplan.clear_week_meal_plan()`: DELETE all meal_plans for user + week_start that are not time-locked | — | — |
| `---`*Line of Internal Interaction*`---` | | | |
| 🗄️ **Database Objects** | **[D]** `meal_plans` DELETE WHERE `user_id=? AND week_start=?` (respects lock logic on future-only clear) | — | — |

### 17.2 Delete Diner (Family Member) Swimlane

| Lane | Step 1 — Open Diner Profile | Step 2 — Tap Delete | Step 3 — Confirm | Step 4 — Data Purged |
|------|-----------------------------|--------------------|-----------------|-----------------------|
| 👤 **User Actions** | Views diner in ProfilesScreen | Taps delete icon | Confirms dialog | Diner removed from list |
| 🖥️ **Frontend Components** | `ProfilesScreen.jsx`; calls `deleteDiner(userId)` | — | — | Removes diner from local state; if active diner deleted: switches to another |
| ···*Line of Visibility*··· | | | | |
| 🔌 **API Contract** | `DELETE /users/{userId}` ← `{success:true}` | — | — | — |
| ⚙️ **Backend Services** | `users.delete_user()`: normalise `fm:` prefix; DELETE from `family_members`; cascade DELETE from `meal_plans`, `shopping_selections`, `favourites`, `nutrient_thresholds` | — | — | — |
| `---`*Line of Internal Interaction*`---` | | | | |
| 🗄️ **Database Objects** | **[D]** `family_members` WHERE `id=?`; **[D]** `meal_plans` WHERE `user_id='fm:<id>'`; **[D]** `shopping_selections` WHERE `user_id='fm:<id>'`; **[D]** `favourites` WHERE `user_id='fm:<id>'`; **[D]** `nutrient_thresholds` WHERE `user_id='fm:<id>'` | — | — | — |

---

## 18. Data Dictionary

### 18.1 Table: `users`

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| `id` | TEXT | NOT NULL | — | Primary key; UUID; doubles as auth_user_id |
| `email` | TEXT | YES | — | Unique login email |
| `password_hash` | TEXT | YES | — | SHA-256 hash of password |
| `email_verified_at` | TIMESTAMPTZ | YES | — | Timestamp when OTP was consumed |
| `name` | TEXT | NOT NULL | `'Diner'` | Display name |
| `age` | INTEGER | YES | — | Age in years |
| `sex` | TEXT | YES | — | `'male'` / `'female'` / `'other'` |
| `weight_kg` | DOUBLE PRECISION | YES | — | Body weight |
| `caretaker_id` | TEXT | YES | — | FK to `caretakers.id` (if managed by caretaker) |
| `conditions` | TEXT | NOT NULL | `'[]'` | JSON array of health conditions |
| `diet` | TEXT | NOT NULL | `'none'` | Diet preference: `none` / `vegetarian` / `vegan` / `low_carb` / `keto` |
| `allergies` | TEXT | NOT NULL | `'[]'` | JSON array of allergen strings |
| `recommended_calories` | DOUBLE PRECISION | YES | — | Computed from closest profile match |
| `recommended_protein` | DOUBLE PRECISION | YES | — | Computed from profile match |
| `recommended_carbs` | DOUBLE PRECISION | YES | — | Computed from profile match |
| `recommended_fat` | DOUBLE PRECISION | YES | — | Computed from profile match |
| `created_at` | TIMESTAMPTZ | NOT NULL | `NOW()` | Row creation time |

**Indexes:** `UNIQUE (email)` via `idx_users_email_unique`

---

### 18.2 Table: `caretakers`

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| `id` | TEXT | NOT NULL | — | Primary key; UUID |
| `name` | TEXT | NOT NULL | — | Caretaker display name |
| `auth_user_id` | TEXT | YES | — | UNIQUE FK to `users.id` — the login account |
| `subscription_tier` | TEXT | NOT NULL | `'free'` | `'free'` or `'paid'` |
| `created_at` | TIMESTAMPTZ | NOT NULL | `NOW()` | Row creation time |

**Indexes:** `UNIQUE (auth_user_id)` via `idx_caretakers_auth_user_id`

---

### 18.3 Table: `family_members`

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| `id` | BIGSERIAL | NOT NULL | — | Auto-increment PK; referenced as `fm:<id>` in API |
| `user_id` | TEXT | NOT NULL | — | FK to `users.id` (the caretaker's auth_user_id) |
| `caretaker_id` | TEXT | YES | — | FK to `caretakers.id` |
| `name` | TEXT | NOT NULL | — | Diner display name |
| `avatar` | TEXT | YES | — | Avatar identifier (emoji / colour code) |
| `conditions` | TEXT | YES | — | JSON array of health conditions |
| `dietary_prefs` | TEXT | YES | — | Diet preference string |
| `allergies` | TEXT | YES | — | JSON array of allergen strings |
| `age` | INTEGER | YES | — | Age |
| `sex` | TEXT | YES | — | `'male'` / `'female'` / `'other'` |
| `weight_kg` | DOUBLE PRECISION | YES | — | Body weight |
| `sort_order` | INTEGER | YES | — | Display ordering in ProfilesScreen |
| `created_at` | TIMESTAMPTZ | NOT NULL | `NOW()` | Row creation time |

**Indexes:** `idx_family_members_user (user_id)`, `idx_family_members_caretaker (caretaker_id)`
**Constraints:** FK to `users(id)`, FK to `caretakers(id)`

---

### 18.4 Table: `email_otps`

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| `email` | TEXT | NOT NULL | — | Primary key; the email being verified |
| `otp_code` | TEXT | NOT NULL | — | 6-digit numeric code |
| `expires_at` | TIMESTAMPTZ | NOT NULL | — | now + 10 minutes |
| `verified_at` | TIMESTAMPTZ | YES | — | Set when OTP is verified |
| `verification_token` | TEXT | YES | — | UUID issued after verification; used in `/register` |
| `consumed_at` | TIMESTAMPTZ | YES | — | Set when registration completes; marks token used |
| `created_at` | TIMESTAMPTZ | NOT NULL | `NOW()` | Row creation time |

---

### 18.5 Table: `recipes`

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| `id` | TEXT | NOT NULL | — | Primary key; numeric string seeded from CSV row index |
| `name` | TEXT | NOT NULL | — | Dish name |
| `prep_time` | INTEGER | NOT NULL | — | Prep time in minutes |
| `cook_time` | INTEGER | NOT NULL | — | Cook time in minutes |
| `steps` | TEXT | NOT NULL | `'[]'` | JSON array of instruction strings |
| `ingredients` | TEXT | YES | — | JSON map `{ingredient_name: grams_float}` |
| `category` | TEXT | YES | — | Meal category (Breakfast, Main Dish, Dessert, etc.) |
| `cuisine` | TEXT | YES | — | Cuisine type |
| `keywords` | TEXT | YES | — | Comma-separated tags |
| `description` | TEXT | YES | — | Short description |
| `url` | TEXT | YES | — | Source recipe URL |
| `image_url` | TEXT | YES | — | Dish image URL |
| `calories` | TEXT | YES | — | Kcal per serving (stored as text for flexibility) |
| `protein` | TEXT | YES | — | Grams protein |
| `fat` | TEXT | YES | — | Grams fat |
| `total_carbs` | TEXT | YES | — | Grams carbohydrates |
| `fiber` | TEXT | YES | — | Grams fiber |
| `sugar` | TEXT | YES | — | Grams sugar |
| `cholesterol` | TEXT | YES | — | Mg cholesterol |
| `sodium` | TEXT | YES | — | Mg sodium |
| `saturated_fat` | TEXT | YES | — | Grams saturated fat |
| `trans_fat` | TEXT | YES | — | Grams trans fat |
| `net_carbs` | TEXT | YES | — | Grams net carbs |
| `vitamin_c` | TEXT | YES | — | Mg vitamin C |
| `potassium` | TEXT | YES | — | Mg potassium |
| `calcium` | TEXT | YES | — | Mg calcium |
| `iron` | TEXT | YES | — | Mg iron |
| `allergies` | TEXT | YES | — | JSON array of allergen strings |
| `dietary_habits` | TEXT | YES | — | Diet label string |
| `hypertension_category` | TEXT | YES | — | `'recommend'` / `'avoid'` / `'neutral'` |
| `diabetes_category` | TEXT | YES | — | Same values |
| `cholesterol_category` | TEXT | YES | — | Same values |
| `gout_category` | TEXT | YES | — | Same values |
| `is_vegetarian` | BOOLEAN | NOT NULL | `FALSE` | Diet flag |
| `is_vegan` | BOOLEAN | NOT NULL | `FALSE` | Diet flag |
| `is_gluten_free` | BOOLEAN | NOT NULL | `FALSE` | Diet flag |
| `is_dairy_free` | BOOLEAN | NOT NULL | `FALSE` | Diet flag |
| `is_low_carb` | BOOLEAN | NOT NULL | `FALSE` | Diet flag |
| `is_high_protein` | BOOLEAN | NOT NULL | `FALSE` | Diet flag |
| `is_spicy` | BOOLEAN | NOT NULL | `FALSE` | Taste flag |
| `is_sweet` | BOOLEAN | NOT NULL | `FALSE` | Taste flag |
| `is_salty` | BOOLEAN | NOT NULL | `FALSE` | Taste flag |

---

### 18.6 Table: `ingredients`

Stores pre-computed nutrient values per ingredient name (seeded from dataset).

| Column | Type | Nullable | Description |
|--------|------|----------|-------------|
| `id` | TEXT | NOT NULL | Ingredient name (primary key) |
| `calories` | DOUBLE PRECISION | NOT NULL | Per 100g |
| `protein_g` | DOUBLE PRECISION | NOT NULL | Per 100g |
| `carbs_g` | DOUBLE PRECISION | NOT NULL | Per 100g |
| `fat_g` | DOUBLE PRECISION | NOT NULL | Per 100g |
| `fiber_g` | DOUBLE PRECISION | NOT NULL | Per 100g |
| `sodium_mg` | DOUBLE PRECISION | NOT NULL | Per 100g |
| `cholesterol_mg` | DOUBLE PRECISION | NOT NULL | Per 100g |
| `sugar_g` | DOUBLE PRECISION | NOT NULL | Per 100g |

---

### 18.7 Table: `meal_plans`

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| `id` | BIGSERIAL | NOT NULL | — | Auto-increment PK; used as `entryId` in API |
| `user_id` | TEXT | NOT NULL | — | Diner ID (UUID or `fm:<id>`) |
| `week_start` | TEXT | NOT NULL | — | ISO date string (Monday of week) |
| `day_index` | INTEGER | NOT NULL | — | 0 (Monday) – 6 (Sunday) |
| `meal_type` | TEXT | NOT NULL | — | `breakfast` / `lunch` / `snack` / `dinner` |
| `dish_id` | TEXT | NOT NULL | — | FK-like reference to `recipes.id` |
| `servings` | DOUBLE PRECISION | NOT NULL | `1` | Number of servings the diner eats |
| `custom_ingredients` | TEXT | YES | — | JSON override of ingredient amounts for this serving |
| `entry_order` | INTEGER | NOT NULL | `0` | Position when multiple dishes in one slot |
| `name` | TEXT | YES | — | Snapshot of dish name at plan time |
| `status` | TEXT | YES | `'draft'` | Plan status |
| `created_at` | TIMESTAMPTZ | NOT NULL | `NOW()` | Row creation time |
| `updated_at` | TIMESTAMPTZ | NOT NULL | `NOW()` | Last update time |

**Index:** `idx_meal_plans_user (user_id, week_start, day_index, meal_type)`

---

### 18.8 Table: `favourites`

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| `id` | BIGSERIAL | NOT NULL | — | Auto-increment PK |
| `user_id` | TEXT | NOT NULL | — | Diner ID |
| `dish_id` | TEXT | NOT NULL | — | Recipe ID |
| `created_at` | TIMESTAMPTZ | NOT NULL | `NOW()` | When starred |

**Constraint:** `UNIQUE (user_id, dish_id)` — idempotent star

---

### 18.9 Table: `shopping_selections`

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| `id` | BIGSERIAL | NOT NULL | — | Auto-increment PK |
| `user_id` | TEXT | NOT NULL | — | Diner ID |
| `week_start` | TEXT | NOT NULL | — | ISO date Monday |
| `day_index` | INTEGER | NOT NULL | — | 0–6 |
| `meal_type` | TEXT | NOT NULL | — | `breakfast` / `lunch` / `snack` / `dinner` |

**Constraint:** `UNIQUE (user_id, week_start, day_index, meal_type)` — toggle semantics (insert if absent, delete if present)

---

### 18.10 Table: `nutrient_thresholds`

| Column | Type | Nullable | Description |
|--------|------|----------|-------------|
| `id` | BIGSERIAL | NOT NULL | Auto-increment PK |
| `user_id` | TEXT | NOT NULL | Diner ID |
| `nutrient_key` | TEXT | NOT NULL | e.g. `'calories'`, `'sodium'` |
| `daily_value` | DOUBLE PRECISION | YES | Max daily amount |
| `per_meal_value` | DOUBLE PRECISION | YES | Max per meal |

**Constraint:** `UNIQUE (user_id, nutrient_key)`
**Index:** `idx_nutrient_thresholds_user (user_id)`

---

### 18.11 Table: `meta`

| Column | Type | Description |
|--------|------|-------------|
| `key` | TEXT | Primary key; internal system flag |
| `value` | TEXT | Flag value (e.g. `'1'` = done) |

**Used for:** Tracking one-time DB migrations and backfill operations.

| Key | Meaning |
|-----|---------|
| `dataset_version` | CSV file mtime+size hash — triggers reseed if changed |
| `nutrients_backfilled` | Nutrient columns populated from CSV |
| `ingredients_backfilled` | Ingredients JSON populated from CSV |
| `diet_flags_backfilled` | Boolean diet flags populated |
| `ingredient_bullets_stripped` | Bullet chars removed from ingredient keys |
| `health_categories_backfilled` | Condition category columns populated |
| `category_backfilled` | Category column populated |
| `allergies_backfilled` | Allergies column populated |

---

## 19. Service Dependency Map

```
┌─────────────────────────────────────────────────────────────────────────────┐
│  FRONTEND  (React + Vite)                                                   │
│                                                                             │
│  App.jsx ─────────────────────────────────────────────────────────────────  │
│    │                                                                         │
│    ├── AuthScreen.jsx ──────────────── /auth/*                              │
│    ├── OnboardingScreen.jsx ─────────── /users/*                            │
│    ├── CaretakerSetup.jsx ───────────── /caretakers/*                       │
│    ├── ProfilesScreen.jsx ───────────── /caretakers/*, /users/*             │
│    ├── TodayScreen.jsx ──────────────── /mealplan/*, /dishes/recommend/*    │
│    │     ├── MealCard.jsx                                                   │
│    │     ├── NutritionPanel.jsx ─────── /mealplan/*/nutrients/*             │
│    │     ├── AutofillSettingsModal ──── /mealplan/*/autofill/*              │
│    │     └── ThresholdSettingsModal ─── /thresholds/*                       │
│    ├── DiscoverScreen.jsx ───────────── /dishes/*, /favourites/*            │
│    ├── ShoppingScreen.jsx ───────────── /shopping-list/*                    │
│    └── UpgradePromptModal.jsx ────────── /caretakers/*/tier                 │
│                                                                             │
│  services/api.js  (JWT-injecting HTTP client)                               │
└──────────────────────────────────┬──────────────────────────────────────────┘
                                   │ HTTP / REST
                                   ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│  BACKEND  (Python · FastAPI)                                                │
│                                                                             │
│  main.py                                                                    │
│    ├── Middleware: JWT verification (all non-auth routes)                   │
│    ├── Middleware: CORS                                                     │
│    │                                                                        │
│    ├── routers/auth.py ──────────────── services/security.py               │
│    │                                      (SHA-256 hash, JWT sign/verify)  │
│    │                                                                        │
│    ├── routers/caretakers.py                                                │
│    │                                                                        │
│    ├── routers/users.py ─────────────── services/inputs.py                 │
│    │                                      (recommend_targets ← CSV)        │
│    │                                                                        │
│    ├── routers/dishes.py ────────────── services/recommendation_engine.py  │
│    │                                      filter_dishes()                  │
│    │                                      score_dish()                     │
│    │                                      get_warnings()                   │
│    │                                                                        │
│    ├── routers/mealplan.py ──────────── services/core.py                   │
│    │                                      generate_meal_plan_for_week()    │
│    │                                    services/solver/                   │
│    │                                      core.py  → solve_meal_plan()     │
│    │                                      inputs.py → build_solver_inputs()│
│    │                                      models.py → SolverConfig etc.    │
│    │                                    services/nutrient_calculator.py    │
│    │                                      get_day_nutrients()              │
│    │                                      get_week_nutrients()             │
│    │                                                                        │
│    ├── routers/shopping_list.py ─────── services/shopping_list_generator.py│
│    │                                      is_slot_expired()                │
│    │                                      get_shopping_list()              │
│    │                                                                        │
│    ├── routers/favourites.py                                                │
│    │                                                                        │
│    └── routers/thresholds.py                                                │
│                                                                             │
│  db.py ─────────────────────────────────────────────────────────────────── │
│    ├── _init_schema()       — CREATE TABLE IF NOT EXISTS                   │
│    ├── _migrate_schema()    — ALTER TABLE ADD COLUMN IF MISSING             │
│    ├── _seed_from_dataset() — load recipes_nlp_tagged.csv → INSERT         │
│    └── _backfill_*()        — one-time data migration functions            │
│                                                                             │
│  data.py ───────────────────────────────────────────────────────────────── │
│    ├── load_seed_data()        — @lru_cache; parse CSV; build recipes dict  │
│    ├── _parse_ingredients()   — raw text → {name: grams} map               │
│    ├── _normalize_ingredient_name()                                         │
│    ├── recommend_targets()    — age/sex/weight → closest CSV profile match  │
│    └── load_profiles_dataset() — @lru_cache; Personalized_Diet_Recs.csv    │
└──────────────────────────────────┬──────────────────────────────────────────┘
                                   │ psycopg3 (PostgreSQL wire protocol)
                                   ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│  DATABASE  (PostgreSQL / Cloud SQL)                                         │
│                                                                             │
│  Core tables:                                                               │
│    users ──────── email_otps                                                │
│    caretakers ─── users (auth_user_id)                                      │
│    family_members → users, caretakers                                       │
│                                                                             │
│  Planning tables:                                                           │
│    recipes ◄──────────────────── ingredients                               │
│    meal_plans → recipes (dish_id)                                           │
│    favourites → users, recipes                                              │
│    shopping_selections → users                                              │
│    nutrient_thresholds → users                                              │
│                                                                             │
│  System:                                                                    │
│    meta (migration flags)                                                   │
│                                                                             │
│  Source data (CSV files — used only at startup):                            │
│    datasets/recipes_nlp_tagged.csv ──────────────────► recipes, ingredients│
│    datasets/Personalized_Diet_Recommendations.csv ───► recommend_targets() │
└─────────────────────────────────────────────────────────────────────────────┘

External services (future integration points):
  ┌──────────────────────────────────────┐
  │  SMTP Server (email OTP delivery)    │  Currently: console-only (dev mode)
  │  Payment Gateway (tier upgrade)      │  Currently: direct DB write (no billing)
  │  CDN (recipe images)                 │  Currently: external URLs in image_url col
  └──────────────────────────────────────┘
```

---

## 20. Constants & Configuration Reference

### 20.1 Meal Type Constants

| Meal Type | UI Label | Used in Solver | Cutoff |
|-----------|----------|----------------|--------|
| `breakfast` | Breakfast | ✓ | 10:00 |
| `lunch` | Lunch | ✓ | 14:00 |
| `dinner` | Dinner | ✓ | 20:00 |
| `snack` | Snack | ✗ | — |

> Snack is a display-only slot; the OR-Tools solver does not plan snacks.

### 20.2 Diet Type Constants

| Value | Filters for |
|-------|------------|
| `none` | No dietary filter |
| `vegetarian` | `is_vegetarian = TRUE` |
| `vegan` | `is_vegan = TRUE` |
| `low_carb` | `is_low_carb = TRUE` |
| `keto` | `is_keto = TRUE` |
| `pescatarian` | Excludes meat allergens; includes fish |
| `halal` | Excludes pork/alcohol-tagged recipes |

### 20.3 Health Condition → Recipe Category Mapping

| Condition | Recipe Column | "Avoid" logic |
|-----------|--------------|---------------|
| Hypertension | `hypertension_category` | Exclude if value = `'avoid'` |
| High Blood Sugar (Diabetes) | `diabetes_category` | Exclude if value = `'avoid'` |
| High Cholesterol | `cholesterol_category` | Exclude if value = `'avoid'` |
| Gout | `gout_category` | Exclude if value = `'avoid'` |

Category values: `'recommend'` / `'neutral'` / `'avoid'`

### 20.4 Subscription Tier Feature Matrix

| Feature | Free | Paid |
|---------|------|------|
| Register & login | ✓ | ✓ |
| Meal plan (1 diner) | ✓ | ✓ |
| Dish recommendations (top 5) | ✓ | ✓ |
| "Plan with AI" | ✓ | ✓ |
| View nutrients | ✓ | ✓ |
| Shopping list | ✓ | ✓ |
| Favourites | ✓ | ✓ |
| Multiple diners (up to 5) | ✗ | ✓ |
| Full dish recommendation results | ✗ | ✓ |
| Auto-fill week | ✗ | ✓ |
| Custom nutrient thresholds | ✗ | ✓ |

### 20.5 Environment Variables

| Variable | Used by | Description |
|----------|---------|-------------|
| `DATABASE_URL` | `db.py` | PostgreSQL connection string (`postgresql://...`) |
| `JWT_SECRET` | `security.py` | HMAC signing key; must be rotated in production |
| `JWT_EXPIRY_MINUTES` | `security.py` | Token lifetime; default 1440 (24 h) |
| `VITE_API_BASE_URL` | `api.js` (frontend) | Backend URL; defaults to `/api` |
| `SMTP_*` | `auth.py` | Email delivery config (currently unused; OTP logged to console) |

### 20.6 Frontend Component Inventory

| Component | File | Size | Role |
|-----------|------|------|------|
| `App` | `App.jsx` | 17.4 KB | Root router; global auth state; modal orchestration |
| `AuthScreen` | `AuthScreen.jsx` | 13 KB | OTP registration + login |
| `OnboardingScreen` | `OnboardingScreen.jsx` | 11.4 KB | Profile setup wizard |
| `CaretakerSetup` | `CaretakerSetup.jsx` | 3.3 KB | Caretaker account creation |
| `ProfilesScreen` | `ProfilesScreen.jsx` | 37.8 KB | Diner management (largest component) |
| `TodayScreen` | `TodayScreen.jsx` | 34.3 KB | Main meal planning interface |
| `DiscoverScreen` | `DiscoverScreen.jsx` | 25.8 KB | Dish browser, search, filters |
| `ShoppingScreen` | `ShoppingScreen.jsx` | 17.2 KB | Shopping list with range selector |
| `MealCard` | `MealCard.jsx` | 9.4 KB | Single meal entry display |
| `NutritionPanel` | `NutritionPanel.jsx` | 8.5 KB | Daily/weekly nutrient summary |
| `NutritionChart` | `NutritionChart.jsx` | 6 KB | Bar chart vs threshold |
| `AutofillSettingsModal` | `AutofillSettingsModal.jsx` | 5.5 KB | Autofill configuration |
| `ThresholdSettingsModal` | `ThresholdSettingsModal.jsx` | 12.4 KB | Custom nutrient threshold settings |
| `UpgradePromptModal` | `UpgradePromptModal.jsx` | 1.8 KB | Tier upgrade prompt |
| `DayStrip` | `DayStrip.jsx` | 3.8 KB | Day of week navigation |
| `DateRangePicker` | `DateRangePicker.jsx` | 8 KB | Week navigation control |

---

*End of Technical Service Blueprint*
*For questions or updates, contact the Solution Architecture team.*
