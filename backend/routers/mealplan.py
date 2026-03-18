from typing import Any
import json

from fastapi import APIRouter, Depends

from ..constants import CONDITION_RULES, NUTRIENT_KEYS, RDA
from ..data import recommend_targets
from ..db import get_db
from ..schemas import AddMealPlanBody, GeneratePlanBody
from ..services.nutrient_calculator import (
    get_day_nutrients,
    get_week_nutrients,
    load_ingredient_cache,
)
from ..utils import get_current_week_start, parse_float, parse_ingredients_map, parse_json

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


@router.get("/{user_id}")
def get_meal_plan(
    user_id: str,
    weekStart: str | None = None,
    conn: Any = Depends(get_db),
) -> dict:
    ws = weekStart or get_current_week_start()

    rows = conn.execute(
        """
        SELECT mp.*, r.id AS recipe_id, r.name AS recipe_name, r.ingredients AS recipe_ingredients,
               r.category, r.keywords, r.cuisine,
               r.calories, r.protein, r.total_carbs AS carbs, r.fat,
               r.fiber, r.sodium, r.cholesterol, r.sugar
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
                "kcal": parse_float(row.get("calories"), 0.0) * parse_float(row.get("servings"), 1.0),
                "protein": parse_float(row.get("protein"), 0.0) * parse_float(row.get("servings"), 1.0),
                "carbs": parse_float(row.get("carbs"), 0.0) * parse_float(row.get("servings"), 1.0),
                "fat": parse_float(row.get("fat"), 0.0) * parse_float(row.get("servings"), 1.0),
                "sodium": parse_float(row.get("sodium"), 0.0) * parse_float(row.get("servings"), 1.0),
                "fiber": parse_float(row.get("fiber"), 0.0) * parse_float(row.get("servings"), 1.0),
                "cholesterol": parse_float(row.get("cholesterol"), 0.0) * parse_float(row.get("servings"), 1.0),
                "sugar": parse_float(row.get("sugar"), 0.0) * parse_float(row.get("servings"), 1.0),
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

    # Replace existing entry for this slot (1 meal per slot)
    conn.execute(
        "DELETE FROM meal_plans WHERE user_id = ? AND week_start = ? AND day_index = ? AND meal_type = ?",
        (user_id, ws, body.dayIndex, body.mealType),
    )

    conn.execute(
        """
        INSERT INTO meal_plans (user_id, week_start, day_index, meal_type, dish_id, servings, custom_ingredients, entry_order)
        VALUES (?, ?, ?, ?, ?, ?, ?, 0)
        """,
        (
            user_id,
            ws,
            body.dayIndex,
            body.mealType,
            body.dishId,
            body.servings,
            json.dumps(body.customIngredients) if body.customIngredients else None,
        ),
    )
    conn.commit()
    return {"success": True}


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


@router.post("/{user_id}/generate")
def generate_plan(
    user_id: str,
    body: GeneratePlanBody,
    conn: Any = Depends(get_db),
) -> dict:
    from ..services.solver.core import generate_meal_plan_for_week, plan_result_to_entries
    from ..services.solver.models import FixedMealAssignment, SolverConfig, MEALS as SOLVER_MEALS

    ws = body.weekStart or get_current_week_start()
    target_day = body.dayIndex  # None = all days, int = single day

    # Load existing meal plan entries as fixed assignments
    existing = conn.execute(
        "SELECT day_index, meal_type, dish_id, servings FROM meal_plans WHERE user_id = ? AND week_start = ?",
        (user_id, ws),
    ).fetchall()

    num_days = 1 if target_day is not None else min(body.numDays, 7)

    fixed_assignments: list[FixedMealAssignment] = []
    # For single-day mode, collect dish IDs used on OTHER days to exclude
    exclude_recipe_ids: set[str] | None = None
    for row in existing:
        day_idx = int(row["day_index"])
        if target_day is not None:
            if day_idx != target_day:
                # Track dishes used on other days so solver avoids them
                if exclude_recipe_ids is None:
                    exclude_recipe_ids = set()
                exclude_recipe_ids.add(str(row["dish_id"]).removeprefix("r"))
                continue
            day_idx = 0
        fixed_assignments.append(FixedMealAssignment(
            day_index=day_idx,
            meal_type=str(row["meal_type"]),
            recipe_id=str(row["dish_id"]).removeprefix("r"),
            servings=parse_float(row.get("servings"), 1.0),
        ))

    config = SolverConfig(
        num_days=num_days,
        time_limit_seconds=min(body.timeLimitSeconds, 30) if target_day is None else 3,
    )

    try:
        result = generate_meal_plan_for_week(
            conn,
            patient_id=user_id,
            week_start=ws,
            config=config,
            fixed_assignments=fixed_assignments if fixed_assignments else None,
            exclude_recipe_ids=exclude_recipe_ids,
        )
    except (ValueError, RuntimeError) as exc:
        return {"success": False, "error": str(exc)}

    # Write generated entries (only for slots that aren't already filled)
    occupied_slots: set[tuple[int, str]] = set()
    for row in existing:
        occupied_slots.add((int(row["day_index"]), str(row["meal_type"])))

    entries_written = 0
    for entry in result.entries:
        # Remap day index back for single-day mode
        actual_day = (target_day if target_day is not None else entry.day_index)
        if (actual_day, entry.meal_type) in occupied_slots:
            continue

        # Ensure only 1 entry per slot
        conn.execute(
            "DELETE FROM meal_plans WHERE user_id = ? AND week_start = ? AND day_index = ? AND meal_type = ?",
            (user_id, ws, actual_day, entry.meal_type),
        )

        conn.execute(
            "INSERT INTO meal_plans (user_id, week_start, day_index, meal_type, dish_id, servings, entry_order) VALUES (?, ?, ?, ?, ?, ?, 0)",
            (user_id, ws, actual_day, entry.meal_type, entry.recipe_id, entry.servings),
        )
        entries_written += 1

    conn.commit()

    return {
        "success": True,
        "entriesWritten": entries_written,
        "totalSlots": config.num_days * len(SOLVER_MEALS),
        "existingSlots": len(occupied_slots),
    }
