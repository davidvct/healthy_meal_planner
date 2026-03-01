import json
import sqlite3
import uuid

from fastapi import APIRouter, Depends, HTTPException

from ..data import recommend_targets
from ..db import get_db
from ..schemas import UserProfileBody

router = APIRouter(prefix="/users", tags=["users"])


def _profile_payload(row: sqlite3.Row) -> dict:
    return {
        "userId": row["id"],
        "name": row["name"],
        "age": row["age"],
        "sex": row["sex"],
        "weightKg": row["weight_kg"],
        "caretakerId": row["caretaker_id"],
        "conditions": json.loads(row["conditions"]),
        "diet": row["diet"],
        "allergies": json.loads(row["allergies"]),
        "recommendedTargets": {
            "calories": row["recommended_calories"],
            "protein": row["recommended_protein"],
            "carbs": row["recommended_carbs"],
            "fat": row["recommended_fat"],
        },
    }


@router.post("/profile")
def create_or_update_profile(
    body: UserProfileBody, conn: sqlite3.Connection = Depends(get_db)
) -> dict:
    user_id = body.userId or str(uuid.uuid4())
    targets = recommend_targets(body.age, body.sex, body.weightKg, body.diet)

    conn.execute(
        """
        INSERT INTO users (
          id, name, age, sex, weight_kg, caretaker_id, conditions, diet, allergies,
          recommended_calories, recommended_protein, recommended_carbs, recommended_fat
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ON CONFLICT(id) DO UPDATE SET
          name = excluded.name,
          age = excluded.age,
          sex = excluded.sex,
          weight_kg = excluded.weight_kg,
          caretaker_id = excluded.caretaker_id,
          conditions = excluded.conditions,
          diet = excluded.diet,
          allergies = excluded.allergies,
          recommended_calories = excluded.recommended_calories,
          recommended_protein = excluded.recommended_protein,
          recommended_carbs = excluded.recommended_carbs,
          recommended_fat = excluded.recommended_fat
        """,
        (
            user_id,
            body.name,
            body.age,
            body.sex,
            body.weightKg,
            body.caretakerId,
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

    row = conn.execute("SELECT * FROM users WHERE id = ?", (user_id,)).fetchone()
    return _profile_payload(row)


@router.get("/{user_id}")
def get_profile(user_id: str, conn: sqlite3.Connection = Depends(get_db)) -> dict:
    row = conn.execute("SELECT * FROM users WHERE id = ?", (user_id,)).fetchone()
    if not row:
        raise HTTPException(status_code=404, detail="User not found")

    return _profile_payload(row)


@router.delete("/{user_id}")
def delete_user(user_id: str, conn: sqlite3.Connection = Depends(get_db)) -> dict[str, bool]:
    conn.execute("DELETE FROM shopping_selections WHERE user_id = ?", (user_id,))
    conn.execute("DELETE FROM meal_plans WHERE user_id = ?", (user_id,))
    conn.execute("DELETE FROM users WHERE id = ?", (user_id,))
    conn.commit()
    return {"success": True}
