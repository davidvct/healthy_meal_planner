#!/usr/bin/env bash
# ─────────────────────────────────────────────────────────────────────
# check-regression.sh — lightweight static regression checks
#
# Scans source files for known breakage patterns (disabled SMTP,
# missing tier gates, removed routes, etc.) so they're caught before
# commit / deploy.
#
# Usage:  ./scripts/check-regression.sh
# Exit:   0 = all pass, 1 = at least one failure
# ─────────────────────────────────────────────────────────────────────
set -euo pipefail

REPO_ROOT="$(cd "$(dirname "$0")/.." && pwd)"

PASS=0
FAIL=0

green() { printf '\033[32m✓ PASS\033[0m %s\n' "$1"; PASS=$((PASS + 1)); }
red()   { printf '\033[31m✗ FAIL\033[0m %s\n' "$1"; FAIL=$((FAIL + 1)); }
header(){ printf '\n\033[1;34m── %s ──\033[0m\n' "$1"; }

# ── Helper: extract lines between two patterns (exclusive) ──────────
between() {
  # between <file> <start_pattern> <end_pattern>
  sed -n "/$2/,/$3/p" "$1" | sed '1d;$d'
}

# =====================================================================
header "External Service Integrations"
# =====================================================================

# 1. SMTP not bypassed — no uncommented "return ..console.." between
#    the credential check and EmailMessage()
AUTH="$REPO_ROOT/backend/routers/auth.py"

smtp_body=$(between "$AUTH" 'def _send_otp_email' 'EmailMessage()')
if echo "$smtp_body" | grep -v '^\s*#' | grep -q 'return.*"console"'; then
  # There should be exactly one (inside the if-not-configured block).
  # Count uncommented returns — more than 1 means an extra bypass exists.
  count=$(echo "$smtp_body" | grep -v '^\s*#' | grep -c 'return.*"console"' || true)
  if [ "$count" -gt 1 ]; then
    red "SMTP bypass: found $count uncommented 'return console' before EmailMessage()"
  else
    green "SMTP: single fallback return (inside credential check)"
  fi
else
  green "SMTP: no unconditional bypass"
fi

# 2. Resend API not bypassed — _send_email must reach requests.post
ADMIN="$REPO_ROOT/backend/routers/admin.py"

resend_body=$(between "$ADMIN" 'def _send_email' '^def \|^@router\|^# ──')
if echo "$resend_body" | grep -v '^\s*#' | grep -q 'requests.post'; then
  green "Resend API: requests.post call present in _send_email"
else
  red "Resend API: requests.post call missing or commented out in _send_email"
fi

# =====================================================================
header "Authentication & Security"
# =====================================================================

MAIN="$REPO_ROOT/backend/main.py"

# 3. JWT middleware active
if grep -q 'async def require_jwt_for_api' "$MAIN" && \
   ! grep -qE '^\s*#.*async def require_jwt_for_api' "$MAIN"; then
  green "JWT middleware: require_jwt_for_api is defined and active"
else
  red "JWT middleware: require_jwt_for_api is missing or commented out"
fi

# 4. Password hashing not hardcoded
hash_body=$(sed -n '/def _hash_password/,/^def \|^@/p' "$AUTH" | head -5)
if echo "$hash_body" | grep -q 'hashlib\.\|bcrypt\|argon2\|pbkdf2'; then
  green "Password hashing: uses a hash algorithm"
else
  red "Password hashing: _hash_password may be hardcoded or missing"
fi

# 5. Admin API key check present
if grep -q 'ADMIN_API_KEY' "$ADMIN" && grep -q '_require_admin_key' "$ADMIN"; then
  green "Admin auth: ADMIN_API_KEY check present"
else
  red "Admin auth: ADMIN_API_KEY check missing"
fi

# =====================================================================
header "Tier / Subscription Gating"
# =====================================================================

MEALPLAN="$REPO_ROOT/backend/routers/mealplan.py"
THRESHOLDS="$REPO_ROOT/backend/routers/thresholds.py"
USERS="$REPO_ROOT/backend/routers/users.py"
DISHES="$REPO_ROOT/backend/routers/dishes.py"

# 6. require_paid_tier on autofill endpoints
autofill_count=$(grep -c 'require_paid_tier' "$MEALPLAN" || true)
if [ "$autofill_count" -ge 2 ]; then
  green "Tier gate: require_paid_tier on autofill endpoints ($autofill_count refs)"
else
  red "Tier gate: require_paid_tier missing on autofill endpoints (found $autofill_count, need ≥2)"
fi

# 7. require_paid_tier on thresholds PUT
if grep -q 'require_paid_tier' "$THRESHOLDS"; then
  green "Tier gate: require_paid_tier on thresholds endpoint"
else
  red "Tier gate: require_paid_tier missing on thresholds endpoint"
fi

# 8. Family member limit for free tier
if grep -q 'tier.*!=.*"paid"' "$USERS" || grep -q 'tier != "paid"' "$USERS"; then
  green "Tier gate: family member limit check present in users.py"
else
  red "Tier gate: family member limit check missing in users.py"
fi

# 9. Dish recommendation limit for free tier
if grep -q 'scored\[:5\]' "$DISHES" || grep -q 'scored\[:\d' "$DISHES"; then
  green "Tier gate: dish recommendation limit present in dishes.py"
else
  red "Tier gate: dish recommendation limit missing in dishes.py"
fi

# =====================================================================
header "App Integrity"
# =====================================================================

# 10. All routers registered
EXPECTED_ROUTERS="auth users mealplan dishes caretakers favourites shopping_list health thresholds admin health_metrics"
missing_routers=""
for r in $EXPECTED_ROUTERS; do
  if ! grep -q "include_router(${r}\.router" "$MAIN"; then
    missing_routers="$missing_routers $r"
  fi
done
if [ -z "$missing_routers" ]; then
  green "Routers: all 11 routers registered in main.py"
else
  red "Routers: missing registrations:$missing_routers"
fi

# 11. Database URL must be postgres
DB="$REPO_ROOT/backend/db.py"
if grep -q 'postgres://' "$DB" && grep -q 'postgresql://' "$DB"; then
  green "Database: PostgreSQL URL validation present in db.py"
else
  red "Database: PostgreSQL URL validation missing in db.py"
fi

# 12. Recipe seeding called in init_db
if grep -q '_seed_from_dataset' "$DB"; then
  green "Data seeding: _seed_from_dataset is called"
else
  red "Data seeding: _seed_from_dataset is missing from init_db"
fi

# =====================================================================
header "Summary"
# =====================================================================

TOTAL=$((PASS + FAIL))
printf '\n%d/%d checks passed' "$PASS" "$TOTAL"
if [ "$FAIL" -gt 0 ]; then
  printf ' — \033[31m%d FAILED\033[0m\n' "$FAIL"
  exit 1
else
  printf ' — \033[32mall good\033[0m\n'
  exit 0
fi
