from __future__ import annotations

import base64
import hashlib
import hmac
import json
import os
import time
from typing import Any


JWT_ALG = "HS256"
JWT_TYP = "JWT"
JWT_EXP_MINUTES = int(os.getenv("JWT_EXP_MINUTES", "1440"))


def _b64url_encode(data: bytes) -> str:
    return base64.urlsafe_b64encode(data).rstrip(b"=").decode("ascii")


def _b64url_decode(data: str) -> bytes:
    padding = "=" * (-len(data) % 4)
    return base64.urlsafe_b64decode((data + padding).encode("ascii"))


def _secret() -> bytes:
    secret = os.getenv("JWT_SECRET", "dev-change-this-secret")
    return secret.encode("utf-8")


def create_access_token(auth_user_id: str, email: str, expires_minutes: int | None = None) -> str:
    now = int(time.time())
    exp_delta = (expires_minutes if expires_minutes is not None else JWT_EXP_MINUTES) * 60

    header = {"alg": JWT_ALG, "typ": JWT_TYP}
    payload = {
        "sub": auth_user_id,
        "email": email,
        "iat": now,
        "exp": now + exp_delta,
    }

    header_b64 = _b64url_encode(json.dumps(header, separators=(",", ":")).encode("utf-8"))
    payload_b64 = _b64url_encode(json.dumps(payload, separators=(",", ":")).encode("utf-8"))
    signing_input = f"{header_b64}.{payload_b64}".encode("ascii")

    sig = hmac.new(_secret(), signing_input, hashlib.sha256).digest()
    sig_b64 = _b64url_encode(sig)

    return f"{header_b64}.{payload_b64}.{sig_b64}"


def verify_access_token(token: str) -> dict[str, Any]:
    parts = token.split(".")
    if len(parts) != 3:
        raise ValueError("Malformed token")

    header_b64, payload_b64, sig_b64 = parts

    try:
        header = json.loads(_b64url_decode(header_b64).decode("utf-8"))
        payload = json.loads(_b64url_decode(payload_b64).decode("utf-8"))
    except Exception as exc:
        raise ValueError("Invalid token encoding") from exc

    if header.get("alg") != JWT_ALG:
        raise ValueError("Unsupported JWT algorithm")

    signing_input = f"{header_b64}.{payload_b64}".encode("ascii")
    expected_sig = hmac.new(_secret(), signing_input, hashlib.sha256).digest()
    actual_sig = _b64url_decode(sig_b64)

    if not hmac.compare_digest(expected_sig, actual_sig):
        raise ValueError("Invalid token signature")

    exp = int(payload.get("exp", 0))
    now = int(time.time())
    if now >= exp:
        raise ValueError("Token expired")

    if not payload.get("sub"):
        raise ValueError("Token subject missing")

    return payload
