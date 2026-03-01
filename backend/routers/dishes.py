import sqlite3

from fastapi import APIRouter, Depends, HTTPException, Query

from ..constants import NUTRIENT_KEYS
from ..db import get_db
from ..services.nutrient_calculator import (
    get_day_nutrients,
    get_dish_nutrients,
    load_ingredient_cache,
)
from ..services.recommendation_engine import filter_dishes, get_warnings, score_dish
from ..utils import get_current_week_start, parse_json

router = APIRouter(prefix="/dishes", tags=["dishes"])


def _dish_payload(row: sqlite3.Row) -> dict:
    nutrients = {k: float(row[k] or 0) for k in NUTRIENT_KEYS}
    return {
        **dict(row),
        "mealTypes": parse_json(row["meal_types"], []),
        "tags": parse_json(row["tags"], []),
        "ingredients": parse_json(row["ingredients"], {}),
        "allergies": parse_json(row["allergies"], []),
        "nutrients": nutrients,
    }


@router.get("")
def get_all_dishes(conn: sqlite3.Connection = Depends(get_db)) -> list[dict]:
    rows = conn.execute("SELECT * FROM dishes").fetchall()
    return [_dish_payload(row) for row in rows]


@router.get("/recommend/{user_id}")
def recommend_dishes(
    user_id: str,
    day: int = Query(default=0),
    mealType: str = Query(default="lunch"),
    filterMealType: str = Query(default="true"),
    filterDiet: str = Query(default="true"),
    filterAllergies: str = Query(default="true"),
    filterConditions: str = Query(default="true"),
    search: str | None = Query(default=None),
    weekStart: str | None = Query(default=None),
    conn: sqlite3.Connection = Depends(get_db),
) -> dict:
    ws = weekStart or get_current_week_start()

    user = conn.execute("SELECT * FROM users WHERE id = ?", (user_id,)).fetchone()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    user_profile = {
        "conditions": parse_json(user["conditions"], []),
        "diet": user["diet"],
        "allergies": parse_json(user["allergies"], []),
    }

    all_dishes = conn.execute("SELECT * FROM dishes").fetchall()

    day_entries = conn.execute(
        """
        SELECT mp.*, d.ingredients, d.calories, d.protein, d.carbs, d.fat, d.fiber, d.sodium, d.cholesterol, d.sugar
        FROM meal_plans mp
        JOIN dishes d ON d.id = mp.dish_id
        WHERE mp.user_id = ? AND mp.week_start = ? AND mp.day_index = ?
        """,
        (user_id, ws, day),
    ).fetchall()

    all_week_entries = conn.execute(
        "SELECT dish_id FROM meal_plans WHERE user_id = ? AND week_start = ?", (user_id, ws)
    ).fetchall()

    ingredient_cache = load_ingredient_cache(conn)

    filtered = filter_dishes(
        all_dishes,
        user_profile,
        mealType,
        ingredient_cache,
        filter_meal_type=filterMealType != "false",
        filter_diet=filterDiet != "false",
        filter_allergies=filterAllergies != "false",
        filter_conditions=filterConditions != "false",
    )

    results = filtered
    if search and search.strip():
        q = search.lower().strip()
        results = [
            d
            for d in filtered
            if q in d["name"].lower() or any(q in t for t in parse_json(d["tags"], []))
        ]

    scored = []
    for dish in results:
        ingredients = parse_json(dish["ingredients"], {})
        row_nutrients = {k: float(dish[k] or 0) for k in NUTRIENT_KEYS}
        nutrients = get_dish_nutrients(ingredients, ingredient_cache, dish_nutrients=row_nutrients)
        score = score_dish(dish, user_profile["conditions"], day_entries, mealType, all_week_entries, ingredient_cache)
        warnings = get_warnings(nutrients, user_profile["conditions"], dish)
        scored.append(
            {
                "dish": _dish_payload(dish),
                "score": score,
                "warnings": warnings,
                "nutrients": nutrients,
            }
        )

    scored.sort(key=lambda item: item["score"]["total"], reverse=True)
    day_nutrients = get_day_nutrients(day_entries, ingredient_cache)

    return {"scored": scored, "dayNutrients": day_nutrients}


@router.get("/{dish_id}")
def get_dish_detail(dish_id: str, conn: sqlite3.Connection = Depends(get_db)) -> dict:
    dish = conn.execute("SELECT * FROM dishes WHERE id = ?", (dish_id,)).fetchone()
    if not dish:
        raise HTTPException(status_code=404, detail="Dish not found")

    recipe = None
    if dish["recipe_id"]:
        recipe_row = conn.execute("SELECT * FROM recipes WHERE id = ?", (dish["recipe_id"],)).fetchone()
        if recipe_row:
            recipe = {**dict(recipe_row), "steps": parse_json(recipe_row["steps"], [])}

    return {
        **_dish_payload(dish),
        "recipe": recipe,
    }
