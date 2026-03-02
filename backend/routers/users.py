from typing import Any
import json

from fastapi import APIRouter, Depends, HTTPException, Request

from ..data import recommend_targets
from ..db import get_db
from ..schemas import UserProfileBody

router = APIRouter(prefix="/users", tags=["users"])


def _json_list(value: Any) -> list[str]:
    if value is None:
        return []
    if isinstance(value, list):
        return [str(v) for v in value]
    if isinstance(value, str):
        try:
            parsed = json.loads(value)
            if isinstance(parsed, list):
                return [str(v) for v in parsed]
        except Exception:
            pass
    return []


def _normalize_member_user_id(value: str) -> str:
    text = str(value or "").strip()
    if text.startswith("fm:"):
        return text[3:]
    return text


def _to_member_profile(row: dict[str, Any], caretaker_id: str | None = None) -> dict:
    member_id = str(row.get("id"))
    return {
        "userId": f"fm:{member_id}",
        "name": row.get("name") or "Diner",
        "age": row.get("age"),
        "sex": row.get("sex"),
        "weightKg": row.get("weight_kg"),
        "caretakerId": caretaker_id,
        "conditions": _json_list(row.get("conditions")),
        "diet": (row.get("dietary_prefs") or "none"),
        "allergies": _json_list(row.get("allergies")),
        "recommendedTargets": {
            "calories": None,
            "protein": None,
            "carbs": None,
            "fat": None,
        },
    }


def _to_user_profile(row: dict[str, Any]) -> dict:
    diet_value = row.get("diet") or row.get("dietary_habits") or "none"
    recommended_fat = row.get("recommended_fat")
    if recommended_fat is None:
        recommended_fat = row.get("recommended_fats")

    return {
        "userId": row["id"],
        "name": row.get("name") or "Diner",
        "age": row.get("age"),
        "sex": row.get("sex"),
        "weightKg": row.get("weight_kg"),
        "caretakerId": row.get("caretaker_id"),
        "conditions": _json_list(row.get("conditions")),
        "diet": diet_value,
        "allergies": _json_list(row.get("allergies")),
        "recommendedTargets": {
            "calories": row.get("recommended_calories"),
            "protein": row.get("recommended_protein"),
            "carbs": row.get("recommended_carbs"),
            "fat": recommended_fat,
        },
    }


@router.post("/profile")
def create_or_update_profile(
    body: UserProfileBody, request: Request, conn: Any = Depends(get_db)
) -> dict:
    auth = getattr(request.state, "auth", {}) or {}
    auth_user_id = auth.get("sub")
    auth_email = auth.get("email")
    if not auth_user_id or not auth_email:
        raise HTTPException(status_code=401, detail="Invalid or missing auth session")

    # Family member flow: write ONLY to family_members.
    if body.caretakerId:
        caretaker = conn.execute(
            "SELECT id, auth_user_id FROM caretakers WHERE id = ?",
            (body.caretakerId,),
        ).fetchone()
        if not caretaker:
            raise HTTPException(status_code=404, detail="Caretaker not found")
        if caretaker.get("auth_user_id") != auth_user_id:
            raise HTTPException(status_code=403, detail="Not allowed for this caretaker")

        member_pk = _normalize_member_user_id(body.userId) if body.userId else None
        if member_pk:
            existing = conn.execute(
                "SELECT id FROM family_members WHERE id::text = ? AND user_id = ?",
                (member_pk, auth_user_id),
            ).fetchone()
            if not existing:
                raise HTTPException(status_code=404, detail="Family member not found")

            conn.execute(
                """
                UPDATE family_members
                SET caretaker_id = ?, name = ?, conditions = ?, dietary_prefs = ?, allergies = ?, age = ?, sex = ?, weight_kg = ?
                WHERE id::text = ? AND user_id = ?
                """,
                (
                    body.caretakerId,
                    body.name,
                    json.dumps(body.conditions),
                    body.diet,
                    json.dumps(body.allergies),
                    body.age,
                    body.sex,
                    body.weightKg,
                    member_pk,
                    auth_user_id,
                ),
            )
        else:
            order_row = conn.execute(
                "SELECT COALESCE(MAX(sort_order), 0) AS m FROM family_members WHERE user_id = ?",
                (auth_user_id,),
            ).fetchone()
            conn.execute(
                """
                INSERT INTO family_members (user_id, caretaker_id, name, conditions, dietary_prefs, allergies, sort_order, age, sex, weight_kg)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                """,
                (
                    auth_user_id,
                    body.caretakerId,
                    body.name,
                    json.dumps(body.conditions),
                    body.diet,
                    json.dumps(body.allergies),
                    int(order_row["m"]) + 1,
                    body.age,
                    body.sex,
                    body.weightKg,
                ),
            )
            new_row = conn.execute("SELECT currval(pg_get_serial_sequence('family_members','id')) AS id").fetchone()
            member_pk = str(new_row["id"])

        conn.commit()
        member_row = conn.execute(
            "SELECT * FROM family_members WHERE id::text = ? AND user_id = ?",
            (member_pk, auth_user_id),
        ).fetchone()
        return _to_member_profile(member_row, body.caretakerId)

    # Logged-in account profile flow (users table).
    targets = recommend_targets(body.age, body.sex, body.weightKg, body.diet)
    conn.execute(
        """
        INSERT INTO users (
          id, email, name, age, sex, weight_kg, conditions, diet, allergies,
          recommended_calories, recommended_protein, recommended_carbs, recommended_fat
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ON CONFLICT(id) DO UPDATE SET
          name = excluded.name,
          age = excluded.age,
          sex = excluded.sex,
          weight_kg = excluded.weight_kg,
          conditions = excluded.conditions,
          diet = excluded.diet,
          allergies = excluded.allergies,
          recommended_calories = excluded.recommended_calories,
          recommended_protein = excluded.recommended_protein,
          recommended_carbs = excluded.recommended_carbs,
          recommended_fat = excluded.recommended_fat
        """,
        (
            auth_user_id,
            auth_email,
            body.name,
            body.age,
            body.sex,
            body.weightKg,
            json.dumps(body.conditions),
            body.diet,
            json.dumps(body.allergies),
            targets["calories"],
            targets["protein"],
            targets["carbs"],
            targets["fat"],
        ),
    )
    conn.commit()

    row = conn.execute("SELECT * FROM users WHERE id = ?", (auth_user_id,)).fetchone()
    return _to_user_profile(row)


@router.get("/{user_id}")
def get_profile(user_id: str, conn: Any = Depends(get_db)) -> dict:
    if str(user_id).startswith("fm:"):
        member_pk = _normalize_member_user_id(user_id)
        row = conn.execute("SELECT * FROM family_members WHERE id::text = ?", (member_pk,)).fetchone()
        if not row:
            raise HTTPException(status_code=404, detail="Family member not found")
        caretaker_id = row.get("caretaker_id")
        return _to_member_profile(row, caretaker_id)

    row = conn.execute("SELECT * FROM users WHERE id = ?", (user_id,)).fetchone()
    if not row:
        raise HTTPException(status_code=404, detail="User not found")

    return _to_user_profile(row)


@router.delete("/{user_id}")
def delete_user(user_id: str, conn: Any = Depends(get_db)) -> dict[str, bool]:
    if str(user_id).startswith("fm:"):
        member_pk = _normalize_member_user_id(user_id)
        conn.execute("DELETE FROM shopping_selections WHERE user_id = ?", (user_id,))
        conn.execute("DELETE FROM meal_plans WHERE user_id = ?", (user_id,))
        conn.execute("DELETE FROM family_members WHERE id::text = ?", (member_pk,))
        conn.commit()
        return {"success": True}

    conn.execute("DELETE FROM shopping_selections WHERE user_id = ?", (user_id,))
    conn.execute("DELETE FROM meal_plans WHERE user_id = ?", (user_id,))
    conn.execute("DELETE FROM users WHERE id = ?", (user_id,))
    conn.commit()
    return {"success": True}
