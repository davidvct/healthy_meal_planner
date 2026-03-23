"""Unified profile loader — single source of truth for user/family-member profiles.
"""
from __future__ import annotations

from dataclasses import dataclass
from typing import Any

from ..data import recommend_targets
from ..utils import parse_float, parse_json


def _normalize_list(value: Any) -> list[str]:
    parsed = parse_json(value, None)
    if isinstance(parsed, list):
        return [str(item).strip() for item in parsed if str(item).strip()]
    if isinstance(value, str):
        text = value.strip()
        if not text:
            return []
        return [item.strip() for item in text.split(",") if item.strip()]
    return []


@dataclass
class UserProfile:
    patient_id: str
    source: str          # "user" | "family_member"
    conditions: list[str]
    diet: str
    allergies: list[str]
    recommended_calories: float
    recommended_protein: float
    recommended_carbs: float
    recommended_fat: float
    # Optional demographic fields (not always available)
    age: int | None = None
    sex: str | None = None
    weight_kg: float | None = None


def load_user_profile(conn: Any, user_id: str) -> UserProfile | None:
    """Load a user or family-member profile and return a ``UserProfile``.

    Resolution order:
    1. Users table (bare UUID or fm:-prefixed — the fm: prefix is also tried
       against the users table for backwards compat).
    2. Family-members table (only for fm:-prefixed IDs).

    Returns ``None`` if no matching record is found.
    """
    uid = str(user_id or "")

    # Try bare UUID against the users table first (covers both plain users and
    # fm:-prefixed IDs whose owner is mirrored in the users table).
    lookup_ids: list[str] = [uid]
    if uid.startswith("fm:"):
        lookup_ids.insert(0, uid[3:])

    for lookup_id in lookup_ids:
        row = conn.execute("SELECT * FROM users WHERE id = ?", (lookup_id,)).fetchone()
        if not row:
            continue

        age = int(parse_float(row.get("age"), 0.0)) if row.get("age") is not None else None
        weight_kg = parse_float(row.get("weight_kg"), 0.0) if row.get("weight_kg") is not None else None
        diet = str(row.get("diet") or row.get("dietary_habits") or "none").strip().lower() or "none"
        fallback = recommend_targets(age, row.get("sex"), weight_kg, diet)
        return UserProfile(
            patient_id=uid,
            source="user",
            age=age,
            sex=row.get("sex"),
            weight_kg=weight_kg,
            conditions=_normalize_list(row.get("conditions")),
            diet=diet,
            allergies=_normalize_list(row.get("allergies")),
            recommended_calories=parse_float(row.get("recommended_calories"), fallback["calories"]),
            recommended_protein=parse_float(row.get("recommended_protein"), fallback["protein"]),
            recommended_carbs=parse_float(row.get("recommended_carbs"), fallback["carbs"]),
            recommended_fat=parse_float(row.get("recommended_fat"), fallback["fat"]),
        )

    if uid.startswith("fm:"):
        member_id = uid[3:]
        member = conn.execute(
            "SELECT * FROM family_members WHERE id::text = ?", (member_id,)
        ).fetchone()
        if not member:
            return None

        age = int(parse_float(member.get("age"), 0.0)) if member.get("age") is not None else None
        weight_kg = parse_float(member.get("weight_kg"), 0.0) if member.get("weight_kg") is not None else None
        diet = str(member.get("dietary_prefs") or "none").strip().lower() or "none"
        targets = recommend_targets(age, member.get("sex"), weight_kg, diet)
        return UserProfile(
            patient_id=uid,
            source="family_member",
            age=age,
            sex=member.get("sex"),
            weight_kg=weight_kg,
            conditions=_normalize_list(member.get("conditions")),
            diet=diet,
            allergies=_normalize_list(member.get("allergies")),
            recommended_calories=targets["calories"],
            recommended_protein=targets["protein"],
            recommended_carbs=targets["carbs"],
            recommended_fat=targets["fat"],
        )

    return None