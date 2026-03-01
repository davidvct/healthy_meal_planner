import hashlib
import os
import re
import secrets
import smtplib
import sqlite3
import uuid
from datetime import datetime, timedelta, timezone
from email.message import EmailMessage

from fastapi import APIRouter, Depends, HTTPException

from ..db import get_db
from ..security import create_access_token
from ..schemas import LoginBody, RegisterBody, RequestOtpBody, VerifyOtpBody

router = APIRouter(prefix="/auth", tags=["auth"])


def _utc_now() -> datetime:
    return datetime.now(timezone.utc)


def _iso(dt: datetime) -> str:
    return dt.replace(microsecond=0).isoformat()


def _normalize_email(email: str) -> str:
    return email.strip().lower()


def _hash_password(password: str) -> str:
    return hashlib.sha256(password.encode("utf-8")).hexdigest()


def _validate_password_complexity(password: str) -> None:
    if len(password) < 8:
        raise HTTPException(status_code=400, detail="Password must be at least 8 characters")
    if not re.search(r"[A-Z]", password):
        raise HTTPException(status_code=400, detail="Password must contain at least one uppercase letter")
    if not re.search(r"\d", password):
        raise HTTPException(status_code=400, detail="Password must contain at least one number")
    if not re.search(r"[^A-Za-z0-9]", password):
        raise HTTPException(status_code=400, detail="Password must contain at least one special character")


def _send_otp_email(email: str, otp_code: str) -> str:
    smtp_host = os.getenv("SMTP_HOST")
    smtp_port = int(os.getenv("SMTP_PORT", "587"))
    smtp_user = os.getenv("SMTP_USER")
    smtp_password = os.getenv("SMTP_PASSWORD")
    smtp_from = os.getenv("SMTP_FROM", smtp_user or "no-reply@mealwise.local")

    if not smtp_host or not smtp_user or not smtp_password:
        print(f"[auth] OTP for {email}: {otp_code}")
        return "console"

    message = EmailMessage()
    message["Subject"] = "MealWise OTP Verification"
    message["From"] = smtp_from
    message["To"] = email
    message.set_content(
        f"Your MealWise OTP is: {otp_code}\n"
        "It expires in 10 minutes.\n"
        "If you did not request this, you can ignore this message."
    )

    with smtplib.SMTP(smtp_host, smtp_port, timeout=15) as client:
        client.starttls()
        client.login(smtp_user, smtp_password)
        client.send_message(message)

    return "email"


@router.post("/request-otp")
def request_otp(body: RequestOtpBody, conn: sqlite3.Connection = Depends(get_db)) -> dict:
    email = _normalize_email(body.email)
    if "@" not in email:
        raise HTTPException(status_code=400, detail="Invalid email address")

    existing_user = conn.execute("SELECT id FROM auth_users WHERE email = ?", (email,)).fetchone()
    if existing_user:
        raise HTTPException(status_code=409, detail="Email is already registered")

    otp_code = f"{secrets.randbelow(1000000):06d}"
    expires_at = _utc_now() + timedelta(minutes=10)

    conn.execute(
        """
        INSERT INTO email_otps (email, otp_code, expires_at, verified_at, verification_token, consumed_at, created_at)
        VALUES (?, ?, ?, NULL, NULL, NULL, ?)
        ON CONFLICT(email) DO UPDATE SET
          otp_code = excluded.otp_code,
          expires_at = excluded.expires_at,
          verified_at = NULL,
          verification_token = NULL,
          consumed_at = NULL,
          created_at = excluded.created_at
        """,
        (email, otp_code, _iso(expires_at), _iso(_utc_now())),
    )
    conn.commit()

    delivery = _send_otp_email(email, otp_code)
    return {"success": True, "delivery": delivery}


@router.post("/verify-otp")
def verify_otp(body: VerifyOtpBody, conn: sqlite3.Connection = Depends(get_db)) -> dict:
    email = _normalize_email(body.email)
    otp = body.otp.strip()

    row = conn.execute("SELECT * FROM email_otps WHERE email = ?", (email,)).fetchone()
    if not row:
        raise HTTPException(status_code=404, detail="OTP request not found")

    if row["consumed_at"]:
        raise HTTPException(status_code=400, detail="OTP already used")

    expires_at = datetime.fromisoformat(row["expires_at"])
    if _utc_now() > expires_at:
        raise HTTPException(status_code=400, detail="OTP has expired")

    if otp != row["otp_code"]:
        raise HTTPException(status_code=400, detail="Invalid OTP")

    token = str(uuid.uuid4())
    now_iso = _iso(_utc_now())
    conn.execute(
        """
        UPDATE email_otps
        SET verified_at = ?, verification_token = ?
        WHERE email = ?
        """,
        (now_iso, token, email),
    )
    conn.commit()

    return {"success": True, "verificationToken": token}


@router.post("/register")
def register(body: RegisterBody, conn: sqlite3.Connection = Depends(get_db)) -> dict:
    email = _normalize_email(body.email)

    if "@" not in email:
        raise HTTPException(status_code=400, detail="Invalid email address")

    _validate_password_complexity(body.password)

    existing_user = conn.execute("SELECT id FROM auth_users WHERE email = ?", (email,)).fetchone()
    if existing_user:
        raise HTTPException(status_code=409, detail="Email is already registered")

    otp_row = conn.execute("SELECT * FROM email_otps WHERE email = ?", (email,)).fetchone()
    if not otp_row:
        raise HTTPException(status_code=400, detail="Email has not been OTP verified")
    if otp_row["consumed_at"]:
        raise HTTPException(status_code=400, detail="Verification token already consumed")
    if otp_row["verification_token"] != body.verificationToken:
        raise HTTPException(status_code=400, detail="Invalid verification token")
    if not otp_row["verified_at"]:
        raise HTTPException(status_code=400, detail="Email has not been OTP verified")

    user_id = str(uuid.uuid4())
    now_iso = _iso(_utc_now())
    conn.execute(
        """
        INSERT INTO auth_users (id, email, password_hash, email_verified_at)
        VALUES (?, ?, ?, ?)
        """,
        (user_id, email, _hash_password(body.password), now_iso),
    )
    conn.execute(
        "UPDATE email_otps SET consumed_at = ? WHERE email = ?",
        (now_iso, email),
    )
    conn.commit()

    return {
        "success": True,
        "user": {
            "authUserId": user_id,
            "email": email,
            "emailVerifiedAt": now_iso,
        },
    }


@router.post("/login")
def login(body: LoginBody, conn: sqlite3.Connection = Depends(get_db)) -> dict:
    email = _normalize_email(body.email)
    password_hash = _hash_password(body.password)

    row = conn.execute(
        "SELECT id, email, email_verified_at, created_at, password_hash FROM auth_users WHERE email = ?",
        (email,),
    ).fetchone()
    if not row:
        raise HTTPException(status_code=401, detail="Invalid email or password")

    if row["password_hash"] != password_hash:
        raise HTTPException(status_code=401, detail="Invalid email or password")

    token = create_access_token(auth_user_id=row["id"], email=row["email"])
    return {
        "success": True,
        "token": token,
        "user": {
            "authUserId": row["id"],
            "email": row["email"],
            "emailVerifiedAt": row["email_verified_at"],
            "createdAt": row["created_at"],
        },
    }
