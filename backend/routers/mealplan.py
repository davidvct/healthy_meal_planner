from typing import Any
import json

from fastapi import APIRouter, Depends

from ..constants import CONDITION_RULES, NUTRIENT_KEYS, RDA
from ..data import recommend_targets
from ..db import get_db
from ..schemas import AddMealPlanBody, AutofillBody
from ..services.nutrient_calculator import (
    get_day_nutrients,
    get_dish_nutrients,
    get_row_nutrients,
    get_week_nutrients,
    load_ingredient_cache,
)
from ..services.recommendation_engine import filter_dishes, score_dish
from .dishes import _load_user_profile, _recipe_to_dish_row
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


AUTOFILL_MEAL_TYPES = ["breakfast", "lunch", "dinner"]
MEAL_CUTOFF = {"breakfast": 10, "lunch": 14, "dinner": 20}


def _is_slot_locked(week_start: str, day_index: int, meal_type: str) -> bool:
    from datetime import datetime, date as date_cls, timedelta

    now = datetime.now()
    today = now.date()
    ws_date = date_cls.fromisoformat(week_start)
    slot_date = ws_date + timedelta(days=day_index)

    if slot_date < today:
        return True
    if slot_date == today:
        cutoff = MEAL_CUTOFF.get(meal_type, 24)
        if now.hour >= cutoff:
            return True
    return False


@router.post("/{user_id}/autofill")
def autofill_plan(
    user_id: str,
    body: AutofillBody,
    conn: Any = Depends(get_db),
) -> dict:
    ws = body.weekStart or get_current_week_start()
    settings = body.settings

    user_profile = _load_user_profile(conn, user_id)
    if not user_profile:
        return {"success": False, "added": 0, "error": "User not found"}

    # Load all recipes once
    recipe_rows = conn.execute("SELECT * FROM recipes").fetchall()
    all_dishes = [_recipe_to_dish_row(r) for r in recipe_rows]
    ingredient_cache = load_ingredient_cache(conn)

    # Load existing meal plan entries for the week
    existing = conn.execute(
        """
        SELECT mp.*, r.ingredients,
               r.calories, r.protein, r.total_carbs AS carbs, r.fat, r.fiber, r.sodium, r.cholesterol, r.sugar
        FROM meal_plans mp
        JOIN recipes r ON (r.id::text = mp.dish_id OR ('r' || r.id::text) = mp.dish_id)
        WHERE mp.user_id = ? AND mp.week_start = ?
        ORDER BY mp.day_index, mp.meal_type, mp.entry_order
        """,
        (user_id, ws),
    ).fetchall()

    # Build a set of occupied slots and collect entries by day
    occupied: dict[tuple[int, str], list[dict]] = {}
    day_entries_map: dict[int, list[dict]] = {d: [] for d in range(7)}
    all_week_dish_ids: list[dict] = [{"dish_id": e["dish_id"]} for e in existing]

    for entry in existing:
        key = (entry["day_index"], entry["meal_type"])
        occupied.setdefault(key, []).append(entry)
        day_entries_map[entry["day_index"]].append(entry)

    added = 0

    for day_index in range(7):
        for meal_type in AUTOFILL_MEAL_TYPES:
            slot_key = (day_index, meal_type)

            # Skip locked (past) slots
            if _is_slot_locked(ws, day_index, meal_type):
                continue

            # Skip non-empty slots
            if occupied.get(slot_key):
                continue

            # Filter dishes for this meal type
            filtered = filter_dishes(
                all_dishes,
                user_profile,
                meal_type,
                ingredient_cache,
                filter_meal_type=True,
                filter_diet=True,
                filter_allergies=True,
                filter_conditions=True,
            )

            # Score and sort
            scored = []
            for dish in filtered:
                score = score_dish(
                    dish,
                    user_profile.get("conditions", []),
                    day_entries_map[day_index],
                    meal_type,
                    all_week_dish_ids,
                    ingredient_cache,
                )
                scored.append((dish, score))
            scored.sort(key=lambda x: x[1]["total"], reverse=True)

            # Track slot nutrients for constraint checking
            slot_nutrients = {"calories": 0.0, "carbs": 0.0, "fat": 0.0}
            slot_dish_count = 0

            # Get current max entry_order for this slot
            max_order_row = conn.execute(
                """
                SELECT COALESCE(MAX(entry_order), -1) as m
                FROM meal_plans
                WHERE user_id = ? AND week_start = ? AND day_index = ? AND meal_type = ?
                """,
                (user_id, ws, day_index, meal_type),
            ).fetchone()
            entry_order = max_order_row["m"] + 1

            for dish, score in scored:
                if slot_dish_count >= settings.maxDishesPerSlot:
                    break

                # Get dish nutrients
                dish_nutrients = get_row_nutrients(dish)

                # Check if adding this dish would exceed constraints
                new_cal = slot_nutrients["calories"] + dish_nutrients.get("calories", 0)
                new_carbs = slot_nutrients["carbs"] + dish_nutrients.get("carbs", 0)
                new_fat = slot_nutrients["fat"] + dish_nutrients.get("fat", 0)

                # If we already have dishes in this slot, check constraints before adding
                if slot_dish_count > 0:
                    if settings.maxCalories is not None and new_cal > settings.maxCalories:
                        break
                    if settings.maxCarbs is not None and new_carbs > settings.maxCarbs:
                        break
                    if settings.maxFat is not None and new_fat > settings.maxFat:
                        break

                # Insert the dish
                dish_id = str(dish["id"])
                conn.execute(
                    """
                    INSERT INTO meal_plans (user_id, week_start, day_index, meal_type, dish_id, servings, custom_ingredients, entry_order)
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
                    """,
                    (user_id, ws, day_index, meal_type, dish_id, 1.0, None, entry_order),
                )
                entry_order += 1
                added += 1
                slot_dish_count += 1
                slot_nutrients["calories"] = new_cal
                slot_nutrients["carbs"] = new_carbs
                slot_nutrients["fat"] = new_fat

                # Update tracking for subsequent scoring
                fake_entry = {"dish_id": dish_id}
                all_week_dish_ids.append(fake_entry)

                # Check constraints after adding
                if settings.maxCalories is not None and slot_nutrients["calories"] >= settings.maxCalories:
                    break
                if settings.maxCarbs is not None and slot_nutrients["carbs"] >= settings.maxCarbs:
                    break
                if settings.maxFat is not None and slot_nutrients["fat"] >= settings.maxFat:
                    break

    conn.commit()
    return {"success": True, "added": added}
