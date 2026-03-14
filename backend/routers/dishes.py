from typing import Any
import json
import re

from fastapi import APIRouter, Depends, HTTPException, Query, Request

from ..constants import NUTRIENT_KEYS
from ..db import get_db
from ..security import get_user_tier
from ..services.nutrient_calculator import (
    get_day_nutrients,
    get_dish_nutrients,
    load_ingredient_cache,
)
from ..services.recommendation_engine import filter_dishes, get_warnings, score_dish
from ..utils import get_current_week_start, parse_ingredients_map, parse_json, parse_float

router = APIRouter(prefix="/dishes", tags=["dishes"])


def _norm_text(value: str) -> str:
    return " ".join((value or "").lower().replace("_", " ").split())


def _derive_meal_types(category: str) -> list[str]:
    c = (category or "").lower()
    meal_types: list[str] = []
    if "breakfast" in c:
        meal_types.append("breakfast")
    if any(x in c for x in ["snack", "dessert", "drink", "beverage", "appetizer"]):
        meal_types.append("snack")
    if "lunch" in c:
        meal_types.append("lunch")
    if "dinner" in c:
        meal_types.append("dinner")
    if any(x in c for x in ["main", "entree", "soup", "salad", "side"]):
        meal_types.extend(["lunch", "dinner"])
    if not meal_types:
        meal_types = ["lunch", "dinner"]
    return list(dict.fromkeys(meal_types))


def _parse_csv_words(value: str) -> list[str]:
    return [x.strip().lower() for x in (value or "").split(",") if x.strip()]


def _recipe_tags(row: dict[str, Any]) -> list[str]:
    tags: list[str] = []
    tags.extend(_parse_csv_words(row.get("cuisine", "")))
    tags.extend(_parse_csv_words(row.get("category", "")))
    tags.extend(_parse_csv_words(row.get("keywords", "")))

    for tag, col in [
        ("vegetarian", "is_vegetarian"),
        ("vegan", "is_vegan"),
        ("gluten_free", "is_gluten_free"),
        ("dairy_free", "is_dairy_free"),
        ("low_carb", "is_low_carb"),
        ("high_protein", "is_high_protein"),
        ("spicy", "is_spicy"),
        ("sweet", "is_sweet"),
        ("salty", "is_salty"),
    ]:
        if row.get(col):
            tags.append(tag)

    cleaned: list[str] = []
    for t in tags:
        x = re.sub(r"\s+", "_", str(t).strip().lower())
        if x and x not in cleaned:
            cleaned.append(x)
    return cleaned


def _diet_label(row: dict[str, Any]) -> str:
    habits = (row.get("dietary_habits") or "").strip().lower()
    if habits:
        return habits
    if row.get("is_vegan"):
        return "vegan"
    if row.get("is_vegetarian"):
        return "vegetarian"
    if row.get("is_low_carb"):
        return "low_carb"
    if row.get("is_keto"):
        return "keto"
    return "none"


def _recipe_to_dish_row(recipe: dict[str, Any]) -> dict[str, Any]:
    recipe_id = str(recipe.get("id"))
    ingredients_map = parse_ingredients_map(recipe.get("ingredients"))
    allergies = _parse_csv_words(recipe.get("allergies") or "")

    return {
        "id": recipe_id,
        "name": recipe.get("name") or f"Recipe {recipe_id}",
        "meal_types": json.dumps(_derive_meal_types(str(recipe.get("category") or ""))),
        "tags": json.dumps(_recipe_tags(recipe)),
        "ingredients": json.dumps(ingredients_map),
        "recipe_id": recipe_id,
        "calories": parse_float(recipe.get("calories"), 0.0),
        "protein": parse_float(recipe.get("protein"), 0.0),
        "carbs": parse_float(recipe.get("total_carbs"), 0.0),
        "fat": parse_float(recipe.get("fat"), 0.0),
        "fiber": parse_float(recipe.get("fiber"), 0.0),
        "sodium": parse_float(recipe.get("sodium"), 0.0),
        "cholesterol": parse_float(recipe.get("cholesterol"), 0.0),
        "sugar": parse_float(recipe.get("sugar"), 0.0),
        "allergies": json.dumps(allergies),
        "diet_label": _diet_label(recipe),
        "hypertension_category": recipe.get("hypertension_category"),
        "diabetes_category": recipe.get("diabetes_category"),
        "cholesterol_category": recipe.get("cholesterol_category"),
        "description": recipe.get("description") or "",
        "source_url": recipe.get("url") or "",
        "image_url": recipe.get("image_url") or "",
    }


def _matches_search(dish: dict[str, Any], search: str) -> bool:
    q = _norm_text(search)
    if not q:
        return True

    q_tokens = [t for t in q.split(" ") if t]
    name = _norm_text(str(dish.get("name", "")))
    tags = [_norm_text(str(t)) for t in parse_json(dish.get("tags"), [])]
    ingredients = [_norm_text(str(i)) for i in parse_json(dish.get("ingredients"), {}).keys()]

    haystacks = [name, *tags, *ingredients]
    return all(any(token in h for h in haystacks) for token in q_tokens)


def _dish_payload(row: dict[str, Any]) -> dict:
    nutrients = {k: float(row[k] or 0) for k in NUTRIENT_KEYS}
    return {
        **dict(row),
        "mealTypes": parse_json(row["meal_types"], []),
        "tags": parse_json(row["tags"], []),
        "ingredients": parse_json(row["ingredients"], {}),
        "allergies": parse_json(row["allergies"], []),
        "nutrients": nutrients,
    }


def _load_user_profile(conn: Any, user_id: str) -> dict[str, Any] | None:
    uid = str(user_id or "")
    if uid.startswith("fm:"):
        member_id = uid[3:]
        member = conn.execute("SELECT * FROM family_members WHERE id::text = ?", (member_id,)).fetchone()
        if not member:
            return None
        return {
            "conditions": parse_json(member.get("conditions"), []),
            "diet": member.get("dietary_prefs") or "none",
            "allergies": parse_json(member.get("allergies"), []),
        }

    user = conn.execute("SELECT * FROM users WHERE id = ?", (uid,)).fetchone()
    if not user:
        return None
    return {
        "conditions": parse_json(user.get("conditions"), []),
        "diet": user.get("diet") or user.get("dietary_habits") or "none",
        "allergies": parse_json(user.get("allergies"), []),
    }


@router.get("")
def get_all_dishes(conn: Any = Depends(get_db)) -> list[dict]:
    recipe_rows = conn.execute("SELECT * FROM recipes").fetchall()
    rows = [_recipe_to_dish_row(r) for r in recipe_rows]
    return [_dish_payload(row) for row in rows]


@router.get("/recommend/{user_id}")
def recommend_dishes(
    user_id: str,
    request: Request,
    day: int = Query(default=0),
    mealType: str = Query(default="lunch"),
    filterMealType: str = Query(default="true"),
    filterDiet: str = Query(default="true"),
    filterAllergies: str = Query(default="true"),
    filterConditions: str = Query(default="true"),
    search: str | None = Query(default=None),
    weekStart: str | None = Query(default=None),
    conn: Any = Depends(get_db),
) -> dict:
    ws = weekStart or get_current_week_start()

    user_profile = _load_user_profile(conn, user_id)
    if not user_profile:
        raise HTTPException(status_code=404, detail="User not found")

    recipe_rows = conn.execute("SELECT * FROM recipes").fetchall()
    all_dishes = [_recipe_to_dish_row(r) for r in recipe_rows]

    day_entries = conn.execute(
        """
        SELECT mp.*, r.ingredients,
               r.calories, r.protein, r.total_carbs AS carbs, r.fat, r.fiber, r.sodium, r.cholesterol, r.sugar
        FROM meal_plans mp
        JOIN recipes r ON (r.id::text = mp.dish_id OR ('r' || r.id::text) = mp.dish_id)
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
        results = [d for d in filtered if _matches_search(d, search)]

        if not results and filterMealType != "false":
            broader = filter_dishes(
                all_dishes,
                user_profile,
                mealType,
                ingredient_cache,
                filter_meal_type=False,
                filter_diet=filterDiet != "false",
                filter_allergies=filterAllergies != "false",
                filter_conditions=filterConditions != "false",
            )
            results = [d for d in broader if _matches_search(d, search)]

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

    tier = get_user_tier(request)
    if tier != "paid":
        scored = scored[:5]

    return {"scored": scored, "dayNutrients": day_nutrients, "tier": tier}


@router.get("/{dish_id}")
def get_dish_detail(dish_id: str, conn: Any = Depends(get_db)) -> dict:
    recipe = conn.execute(
        "SELECT * FROM recipes WHERE id::text = ? OR ('r' || id::text) = ?",
        (dish_id, dish_id),
    ).fetchone()
    if not recipe:
        raise HTTPException(status_code=404, detail="Dish not found")

    dish = _recipe_to_dish_row(recipe)

    instructions = recipe.get("instructions")
    if instructions is None:
        instructions = recipe.get("steps")
    steps = parse_json(instructions, None)
    if not isinstance(steps, list):
        text = str(instructions or "").replace("\r", "\n")
        steps = [line.strip() for line in text.split("\n") if line.strip()]

    recipe_payload = {
        **dict(recipe),
        "steps": steps,
    }

    return {
        **_dish_payload(dish),
        "recipe": recipe_payload,
    }
