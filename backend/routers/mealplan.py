from typing import Any
import json
from datetime import date, timedelta

from fastapi import APIRouter, Depends, HTTPException
from fastapi.encoders import jsonable_encoder

from ..constants import CONDITION_RULES, NUTRIENT_KEYS, RDA
from ..data import recommend_targets
from ..db import get_db
from ..schemas import AddMealPlanBody, GenerateMealPlanBody
from ..services.core import generate_meal_plan_for_week
from ..services.models import SolverConfig
from ..services.nutrient_calculator import (
    get_day_nutrients,
    get_week_nutrients,
    load_ingredient_cache,
)
from ..utils import get_current_week_start, parse_ingredients_map, parse_json

router = APIRouter(prefix="/mealplan", tags=["mealplan"])


def _user_rda(user: dict[str, Any] | None) -> dict[str, float]:
    rda = dict(RDA)
    if not user:
        return rda

    if user.get("recommended_calories"):
        rda["calories"] = float(user["recommended_calories"])
    if user.get("recommended_protein"):
        rda["protein"] = float(user["recommended_protein"])
    if user.get("recommended_carbs"):
        rda["carbs"] = float(user["recommended_carbs"])
    if user.get("recommended_fat"):
        rda["fat"] = float(user["recommended_fat"])

    return rda


def _load_profile_for_plan(conn: Any, user_id: str) -> dict[str, Any] | None:
    uid = str(user_id or "")
    if uid.startswith("fm:"):
        member_id = uid[3:]
        member = conn.execute("SELECT * FROM family_members WHERE id::text = ?", (member_id,)).fetchone()
        if not member:
            return None
        diet = member.get("dietary_prefs") or "none"
        targets = recommend_targets(member.get("age"), member.get("sex"), member.get("weight_kg"), diet)
        return {
            "conditions": member.get("conditions"),
            "recommended_calories": targets["calories"],
            "recommended_protein": targets["protein"],
            "recommended_carbs": targets["carbs"],
            "recommended_fat": targets["fat"],
        }

    return conn.execute("SELECT * FROM users WHERE id = ?", (uid,)).fetchone()


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


def _recipe_tags(row: dict[str, Any]) -> list[str]:
    tags: list[str] = []
    for col in ["cuisine", "category", "keywords"]:
        tags.extend([x.strip().lower() for x in str(row.get(col) or "").split(",") if x.strip()])
    if row.get("is_vegetarian"):
        tags.append("vegetarian")
    if row.get("is_vegan"):
        tags.append("vegan")
    return list(dict.fromkeys(tags))


def _build_generated_meal_plan_rows(
    generated: Any,
    *,
    owner_id: str,
    week_start: str,
    duration_days: int,
) -> tuple[dict[str, Any], list[dict[str, Any]]]:
    start_date = date.fromisoformat(week_start)
    end_date = start_date + timedelta(days=max(0, duration_days - 1))

    meal_plan_row = {
        "id": None,
        "user_id": owner_id,
        "name": None,
        "duration_days": duration_days,
        "start_date": start_date.isoformat(),
        "end_date": end_date.isoformat(),
        "status": "draft",
        "members": None,
        "created_at": None,
        "updated_at": None,
        "week_start": week_start,
    }

    item_rows: list[dict[str, Any]] = []
    for day_index in range(generated.selected_plan.num_days):
        for meal_type, picks in generated.selected_plan.picks[day_index].items():
            for entry_order, pick in enumerate(picks):
                item_rows.append(
                    {
                        "id": None,
                        "meal_plan_id": None,
                        "user_id": owner_id,
                        "week_start": week_start,
                        "day_index": day_index,
                        "meal_type": meal_type,
                        "dish_id": pick.recipe_id,
                        "servings": pick.servings,
                        "custom_ingredients": None,
                        "entry_order": entry_order,
                    }
                )

    return meal_plan_row, item_rows


def _persist_generated_meal_plan(
    conn: Any,
    *,
    user_id: str,
    week_start: str,
    item_rows: list[dict[str, Any]],
) -> list[dict[str, Any]]:
    conn.execute(
        "DELETE FROM meal_plans WHERE user_id = ? AND week_start = ?",
        (user_id, week_start),
    )

    saved_rows: list[dict[str, Any]] = []
    for row in item_rows:
        inserted = conn.execute(
            """
            INSERT INTO meal_plans (user_id, week_start, day_index, meal_type, dish_id, servings, custom_ingredients, entry_order)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
            RETURNING id, user_id, week_start, day_index, meal_type, dish_id, servings, custom_ingredients, entry_order
            """,
            (
                row["user_id"],
                row["week_start"],
                row["day_index"],
                row["meal_type"],
                row["dish_id"],
                row["servings"],
                row["custom_ingredients"],
                row["entry_order"],
            ),
        ).fetchone()
        saved_rows.append(dict(inserted))

    conn.commit()
    return saved_rows


@router.get("/{user_id}")
def get_meal_plan(
    user_id: str,
    weekStart: str | None = None,
    conn: Any = Depends(get_db),
) -> dict:
    ws = weekStart or get_current_week_start()

    rows = conn.execute(
        """
        SELECT mp.*, r.id AS recipe_id, r.name AS recipe_name, r.ingredients AS recipe_ingredients, r.category, r.keywords, r.cuisine
        FROM meal_plans mp
        JOIN recipes r ON (r.id::text = mp.dish_id OR ('r' || r.id::text) = mp.dish_id)
        WHERE mp.user_id = ? AND mp.week_start = ?
        ORDER BY mp.day_index, mp.meal_type, mp.entry_order
        """,
        (user_id, ws),
    ).fetchall()

    plan = {str(i): {} for i in range(7)}
    for row in rows:
        day_key = str(row["day_index"])
        meal_type = row["meal_type"]
        plan.setdefault(day_key, {})
        plan[day_key].setdefault(meal_type, [])
        plan[day_key][meal_type].append(
            {
                "id": row["id"],
                "dishId": str(row["recipe_id"]),
                "dishName": row["recipe_name"],
                "servings": row["servings"],
                "customIngredients": parse_json(row["custom_ingredients"], None),
                "dishIngredients": parse_ingredients_map(row["recipe_ingredients"]),
                "tags": _recipe_tags(row),
                "mealTypes": _derive_meal_types(row.get("category") or ""),
                "recipeId": str(row["recipe_id"]),
            }
        )

    return {int(k): v for k, v in plan.items()}


@router.post("/{user_id}/add")
def add_dish_to_plan(
    user_id: str,
    body: AddMealPlanBody,
    conn: Any = Depends(get_db),
) -> dict[str, bool]:
    ws = body.weekStart or get_current_week_start()

    max_order_row = conn.execute(
        """
        SELECT COALESCE(MAX(entry_order), -1) as m
        FROM meal_plans
        WHERE user_id = ? AND week_start = ? AND day_index = ? AND meal_type = ?
        """,
        (user_id, ws, body.dayIndex, body.mealType),
    ).fetchone()

    conn.execute(
        """
        INSERT INTO meal_plans (user_id, week_start, day_index, meal_type, dish_id, servings, custom_ingredients, entry_order)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        """,
        (
            user_id,
            ws,
            body.dayIndex,
            body.mealType,
            body.dishId,
            body.servings,
            json.dumps(body.customIngredients) if body.customIngredients else None,
            max_order_row["m"] + 1,
        ),
    )
    conn.commit()
    return {"success": True}


@router.post("/{user_id}/generate")
def generate_meal_plan(
    user_id: str,
    body: GenerateMealPlanBody,
    conn: Any = Depends(get_db),
) -> dict[str, Any]:
    ws = body.weekStart or get_current_week_start()

    try:
        generated = generate_meal_plan_for_week(
            conn,
            patient_id=user_id,
            week_start=ws,
            config=SolverConfig(num_days=body.days, max_solutions=body.maxSolutions),
        )
    except ValueError as exc:
        detail = str(exc)
        status = 404 if "not found" in detail.lower() else 400
        raise HTTPException(status_code=status, detail=detail) from exc
    except RuntimeError as exc:
        raise HTTPException(status_code=422, detail=str(exc)) from exc

    meal_plan_row, item_rows = _build_generated_meal_plan_rows(
        generated,
        owner_id=user_id,
        week_start=ws,
        duration_days=body.days,
    )
    saved_rows = _persist_generated_meal_plan(
        conn,
        user_id=user_id,
        week_start=ws,
        item_rows=item_rows,
    )

    return {
        "saved_meal_plans_rows": saved_rows,
        "selected_plan": jsonable_encoder(generated.selected_plan),
        "targets": generated.inputs.targets,
        "profile": generated.inputs.profile,
    }


@router.delete("/{user_id}/remove/{entry_id}")
def remove_dish_from_plan(entry_id: int, user_id: str, conn: Any = Depends(get_db)) -> dict[str, bool]:
    conn.execute("DELETE FROM meal_plans WHERE id = ? AND user_id = ?", (entry_id, user_id))
    conn.commit()
    return {"success": True}


@router.get("/{user_id}/nutrients/week")
def get_weekly_nutrients(
    user_id: str,
    weekStart: str | None = None,
    conn: Any = Depends(get_db),
) -> dict:
    ws = weekStart or get_current_week_start()

    user = _load_profile_for_plan(conn, user_id)
    conditions = parse_json(user.get("conditions") if user else None, [])

    entries = conn.execute(
        """
        SELECT mp.*, r.ingredients,
               r.calories, r.protein, r.total_carbs AS carbs, r.fat, r.fiber, r.sodium, r.cholesterol, r.sugar
        FROM meal_plans mp
        JOIN recipes r ON (r.id::text = mp.dish_id OR ('r' || r.id::text) = mp.dish_id)
        WHERE mp.user_id = ? AND mp.week_start = ?
        ORDER BY mp.day_index
        """,
        (user_id, ws),
    ).fetchall()

    ingredient_cache = load_ingredient_cache(conn)
    week_nutrients = get_week_nutrients(entries, ingredient_cache)

    user_daily_rda = _user_rda(user)
    week_rda = {k: user_daily_rda[k] * 7 for k in NUTRIENT_KEYS}

    daily = []
    for day_index in range(7):
        day_entries = [entry for entry in entries if entry["day_index"] == day_index]
        day_nutrients = get_day_nutrients(day_entries, ingredient_cache)
        warnings: list[str] = []

        for condition in conditions:
            rule = CONDITION_RULES.get(condition)
            if not rule:
                continue
            for nutrient, limit in rule["limit"].items():
                if day_nutrients.get(nutrient, 0) > limit * 3:
                    warnings.append(f"{rule['warnLabel']} for the day")

        daily.append(
            {
                "dayIndex": day_index,
                "nutrients": day_nutrients,
                "hasMeals": len(day_entries) > 0,
                "warnings": list(dict.fromkeys(warnings)),
            }
        )

    return {"weekNutrients": week_nutrients, "weekRDA": week_rda, "daily": daily}


@router.get("/{user_id}/nutrients/day/{day_index}")
def get_daily_nutrients(
    user_id: str,
    day_index: int,
    weekStart: str | None = None,
    conn: Any = Depends(get_db),
) -> dict:
    ws = weekStart or get_current_week_start()

    entries = conn.execute(
        """
        SELECT mp.*, r.ingredients,
               r.calories, r.protein, r.total_carbs AS carbs, r.fat, r.fiber, r.sodium, r.cholesterol, r.sugar
        FROM meal_plans mp
        JOIN recipes r ON (r.id::text = mp.dish_id OR ('r' || r.id::text) = mp.dish_id)
        WHERE mp.user_id = ? AND mp.week_start = ? AND mp.day_index = ?
        """,
        (user_id, ws, day_index),
    ).fetchall()

    ingredient_cache = load_ingredient_cache(conn)
    return get_day_nutrients(entries, ingredient_cache)
