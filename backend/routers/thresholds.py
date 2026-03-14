from typing import Any

from fastapi import APIRouter, Depends

from ..constants import NUTRIENT_COLUMNS, NUTRIENT_COL_TO_KEY, RDA
from ..db import get_db
from ..schemas import SaveThresholdsBody
from ..security import require_paid_tier

router = APIRouter(prefix="/thresholds", tags=["thresholds"])


@router.get("/nutrients")
def get_available_nutrients(conn: Any = Depends(get_db)) -> list[dict]:
    """Return nutrients from the recipes table that actually exist in the DB."""
    rows = conn.execute(
        """
        SELECT column_name
        FROM information_schema.columns
        WHERE table_schema = 'public' AND table_name = 'recipes'
        ORDER BY ordinal_position
        """,
    ).fetchall()

    db_columns = {r["column_name"] for r in rows}

    result = []
    for col, (label, unit) in NUTRIENT_COLUMNS.items():
        if col not in db_columns:
            continue
        key = NUTRIENT_COL_TO_KEY.get(col, col)
        result.append({
            "key": key,
            "label": label,
            "unit": unit,
            "defaultDaily": RDA.get(key),
        })
    return result


@router.get("/{user_id}")
def get_thresholds(user_id: str, conn: Any = Depends(get_db)) -> list[dict]:
    rows = conn.execute(
        "SELECT nutrient_key, daily_value, per_meal_value FROM nutrient_thresholds WHERE user_id = ? ORDER BY id",
        (user_id,),
    ).fetchall()
    return [
        {
            "nutrientKey": r["nutrient_key"],
            "dailyValue": r["daily_value"],
            "perMealValue": r["per_meal_value"],
        }
        for r in rows
    ]


@router.put("/{user_id}")
def save_thresholds(
    user_id: str, body: SaveThresholdsBody, _: str = Depends(require_paid_tier), conn: Any = Depends(get_db)
) -> list[dict]:
    conn.execute("DELETE FROM nutrient_thresholds WHERE user_id = ?", (user_id,))
    for item in body.thresholds:
        conn.execute(
            """
            INSERT INTO nutrient_thresholds (user_id, nutrient_key, daily_value, per_meal_value)
            VALUES (?, ?, ?, ?)
            """,
            (user_id, item.nutrientKey, item.dailyValue, item.perMealValue),
        )
    conn.commit()
    return get_thresholds(user_id, conn)
