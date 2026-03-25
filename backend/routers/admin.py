"""Admin endpoints for automated operations (e.g. Cloud Scheduler triggers).

Secured by X-Admin-Key header — not accessible to regular app users.
"""

from __future__ import annotations

from datetime import datetime, timezone
from typing import Any

import requests
from fastapi import APIRouter, Depends, Header, HTTPException

from ..config import get_setting
from ..db import get_db

router = APIRouter(prefix="/admin", tags=["admin"])

SURVEY_URL = get_setting("SURVEY_URL", "https://forms.gle/YOUR_FORM_ID")
RESEND_API_KEY = get_setting("RESEND_API_KEY", "")
SURVEY_FROM_EMAIL = get_setting("SURVEY_FROM_EMAIL", "MealVitals <noreply@mealvitals.app>")


def _require_admin_key(x_admin_key: str = Header()) -> str:
    expected = get_setting("ADMIN_API_KEY", "")
    if not expected or x_admin_key != expected:
        raise HTTPException(status_code=403, detail="Unauthorized")
    return x_admin_key


# ── Active users query ─────────────────────────────────────────────

def _get_survey_eligible_users(conn: Any) -> list[dict]:
    """Return caretaker (auth) users who:
    1. Signed up at least 6 months ago (created_at <= NOW() - 6 months)
    2. Are active — generated at least 1 meal plan in the past 7 days
    3. Have an email address
    4. Haven't received a survey email in the past 6 months (half-yearly cadence)

    Data model: meal_plans.user_id = 'fm:N' → family_members → caretakers → users (email).
    """
    rows = conn.execute("""
        SELECT DISTINCT
            u.id,
            u.email,
            COALESCE(u.display_name, u.name, 'there') AS name,
            u.created_at,
            u.email_survey_sent_at
        FROM users u
        JOIN caretakers c ON c.auth_user_id = u.id
        JOIN family_members fm ON fm.caretaker_id = c.id::text
        WHERE u.email IS NOT NULL
          AND u.created_at <= NOW() - INTERVAL '6 months'
          AND (u.email_survey_sent_at IS NULL
               OR u.email_survey_sent_at <= NOW() - INTERVAL '6 months')
          AND EXISTS (
              SELECT 1 FROM meal_plans mp
              WHERE mp.user_id = ('fm:' || fm.id::text)
                AND mp.created_at >= NOW() - INTERVAL '7 days'
          )
    """).fetchall()
    return [dict(r) for r in rows]


# ── Email sending ──────────────────────────────────────────────────

def _build_survey_email_html(user_name: str, user_id: str) -> str:
    survey_link = f"{SURVEY_URL}?uid={user_id}&utm_source=email&utm_medium=survey&utm_campaign=monthly_feedback"
    return f"""
    <div style="font-family: 'Plus Jakarta Sans', Arial, sans-serif; max-width: 520px; margin: 0 auto; padding: 24px;">
        <div style="background: #0B2240; border-radius: 12px; padding: 20px 24px; margin-bottom: 20px;">
            <span style="color: #069B8E; font-size: 20px; font-weight: 800;">MealVitals</span>
        </div>
        <p style="font-size: 15px; color: #0B1829; line-height: 1.6;">
            Hi {user_name},
        </p>
        <p style="font-size: 15px; color: #4A6280; line-height: 1.6;">
            Thank you for actively using MealVitals to plan healthy meals!
            We'd love to hear your feedback so we can make the app even better for you
            and your family.
        </p>
        <p style="text-align: center; margin: 28px 0;">
            <a href="{survey_link}"
               style="display: inline-block; background: #069B8E; color: #fff;
                      font-size: 15px; font-weight: 700; padding: 14px 32px;
                      border-radius: 10px; text-decoration: none;">
                Take the 30-second survey &rarr;
            </a>
        </p>
        <p style="font-size: 13px; color: #8A9BB0; line-height: 1.5;">
            Your responses help us improve meal recommendations for people
            managing health conditions like diabetes, hypertension, and
            high cholesterol.
        </p>
        <hr style="border: none; border-top: 1px solid #E8EDF3; margin: 24px 0;" />
        <p style="font-size: 11px; color: #8A9BB0;">
            You're receiving this because you actively use MealVitals.
            If you'd prefer not to receive these, simply ignore this email.
        </p>
    </div>
    """


def _send_email(to_email: str, user_name: str, user_id: str) -> bool:
    """Send survey email via Resend API. Returns True on success."""
    if not RESEND_API_KEY:
        print(f"[admin] RESEND_API_KEY not set — skipping email to {to_email}")
        return False
    try:
        resp = requests.post(
            "https://api.resend.com/emails",
            headers={"Authorization": f"Bearer {RESEND_API_KEY}"},
            json={
                "from": SURVEY_FROM_EMAIL,
                "to": [to_email],
                "subject": "How's your meal planning going? (30-sec survey)",
                "html": _build_survey_email_html(user_name, user_id),
            },
            timeout=10,
        )
        if resp.status_code in (200, 201):
            return True
        print(f"[admin] Resend error {resp.status_code}: {resp.text}")
        return False
    except Exception as exc:
        print(f"[admin] Email send failed for {to_email}: {exc}")
        return False


# ── Endpoint ───────────────────────────────────────────────────────

@router.post("/send-survey")
def send_monthly_survey(
    conn: Any = Depends(get_db),
    _: str = Depends(_require_admin_key),
) -> dict:
    """Send half-yearly survey email to active long-term users.

    Criteria:
    - Signed up at least 6 months ago
    - Generated at least 1 meal plan in the past 7 days (active user)
    - Haven't received a survey email in the past 6 months

    Triggered by Google Cloud Scheduler on the 1st of each month.
    The monthly trigger catches users as they cross the 6-month mark,
    then each user receives at most 1 survey every 6 months.
    """
    eligible = _get_survey_eligible_users(conn)
    print(f"[admin] survey eligible_users={len(eligible)}")

    sent = 0
    skipped = 0
    for user in eligible:
        if _send_email(user["email"], user["name"], user["id"]):
            # Mark as sent so we don't email again this month
            conn.execute(
                "UPDATE users SET email_survey_sent_at = ? WHERE id = ?",
                (datetime.now(timezone.utc), user["id"]),
            )
            sent += 1
        else:
            skipped += 1

    conn.commit()
    print(f"[admin] survey sent={sent} skipped={skipped}")

    return {
        "success": True,
        "eligible": len(eligible),
        "sent": sent,
        "skipped": skipped,
        "timestamp": datetime.now(timezone.utc).isoformat(),
    }


@router.get("/survey-eligible")
def list_survey_eligible_users(
    conn: Any = Depends(get_db),
    _: str = Depends(_require_admin_key),
) -> dict:
    """Preview which users would receive the survey (dry run)."""
    eligible = _get_survey_eligible_users(conn)
    return {
        "count": len(eligible),
        "users": [
            {"id": u["id"], "email": u["email"], "name": u["name"], "last_login": str(u.get("last_login_at", ""))}
            for u in eligible
        ],
    }
