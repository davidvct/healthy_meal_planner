from typing import Any
import json
from datetime import date, timedelta

from fastapi import APIRouter, Depends, HTTPException
from fastapi.encoders import jsonable_encoder

from ..constants import CONDITION_RULES, NUTRIENT_KEYS, RDA
from ..data import recommend_targets
from ..db import get_db
from ..schemas import (
    AddMealPlanBody,
    AutofillBody,
    AutofillConstraintViolation,
    AutofillValidationResponse,
    GenerateMealPlanBody,
    GeneratePlanBody,
)
from ..security import require_paid_tier
from ..services.solver import (
    DEFAULT_MEAL_CALORIE_RATIO,
    FixedMealAssignment,
    MEALS as SOLVER_MEALS,
    SolverConfig,
    generate_meal_plan_for_week,
    normalize_recipe,
    plan_result_to_entries,
)
from ..services.nutrient_calculator import (
    get_day_nutrients,
    get_dish_nutrients,
    get_week_nutrients,
    load_ingredient_cache,
)
from ..utils import get_current_week_start, parse_float, parse_ingredients_map, parse_json, parse_servings_yield

router = APIRouter(prefix="/mealplan", tags=["mealplan"])

AUTOFILL_MEAL_TYPES = ("breakfast", "lunch", "dinner")



def _resolve_max_dishes(raw: int | dict | None) -> int | dict[str, int]:
    """Normalise maxDishesPerSlot from the frontend.

    Accepts either a single int (applied to all meals) or a per-meal dict
    like ``{"breakfast": 1, "lunch": 2, "dinner": 3}``.
    """
    if isinstance(raw, dict):
        return {meal: max(1, int(raw.get(meal, 1))) for meal in AUTOFILL_MEAL_TYPES}
    return max(1, int(raw or 1))


def _max_dishes_for_meal(resolved: int | dict, meal: str) -> int:
    if isinstance(resolved, dict):
        return resolved.get(meal, 1)
    return resolved


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
        SELECT mp.*, r.id AS recipe_id, r.name AS recipe_name, r.ingredients AS recipe_ingredients,
               r.category, r.keywords, r.cuisine, r.servings AS recipe_servings,
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
        recipe_yield = parse_servings_yield(row.get("recipe_servings"))
        mp_servings = parse_float(row.get("servings"), 1.0)
        scale = 1.0 / recipe_yield
        plan[day_key][meal_type].append(
            {
                "id": row["id"],
                "dishId": str(row["recipe_id"]),
                "dishName": row["recipe_name"],
                "servings": row["servings"],
                "servingsQty": int(mp_servings),
                "recipeServings": str(row.get("recipe_servings") or ""),
                "customIngredients": parse_json(row["custom_ingredients"], None),
                "dishIngredients": parse_ingredients_map(row["recipe_ingredients"]),
                "tags": _recipe_tags(row),
                "mealTypes": _derive_meal_types(row.get("category") or ""),
                "recipeId": str(row["recipe_id"]),
                "kcal": round(parse_float(row.get("calories"), 0.0) * scale, 1),
                "protein": round(parse_float(row.get("protein"), 0.0) * scale, 1),
                "carbs": round(parse_float(row.get("carbs"), 0.0) * scale, 1),
                "fat": round(parse_float(row.get("fat"), 0.0) * scale, 1),
                "sodium": round(parse_float(row.get("sodium"), 0.0) * scale, 1),
                "fiber": round(parse_float(row.get("fiber"), 0.0) * scale, 1),
                "cholesterol": round(parse_float(row.get("cholesterol"), 0.0) * scale, 1),
                "sugar": round(parse_float(row.get("sugar"), 0.0) * scale, 1),
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
    MAX_DISHES_PER_SLOT = 3

    # Check how many entries already exist in this slot
    existing = conn.execute(
        "SELECT entry_order FROM meal_plans WHERE user_id = ? AND week_start = ? AND day_index = ? AND meal_type = ? ORDER BY entry_order",
        (user_id, ws, body.dayIndex, body.mealType),
    ).fetchall()

    if len(existing) >= MAX_DISHES_PER_SLOT:
        # Slot is full — replace the last entry
        next_order = existing[-1]["entry_order"]
        conn.execute(
            "DELETE FROM meal_plans WHERE user_id = ? AND week_start = ? AND day_index = ? AND meal_type = ? AND entry_order = ?",
            (user_id, ws, body.dayIndex, body.mealType, next_order),
        )
    else:
        # Append — use next available entry_order
        next_order = (existing[-1]["entry_order"] + 1) if existing else 0

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
            next_order,
        ),
    )
    conn.commit()
    return {"success": True}


@router.delete("/{user_id}/remove/{entry_id}")
def remove_dish_from_plan(entry_id: int, user_id: str, conn: Any = Depends(get_db)) -> dict[str, bool]:
    conn.execute("DELETE FROM meal_plans WHERE id = ? AND user_id = ?", (entry_id, user_id))
    conn.commit()
    return {"success": True}


@router.patch("/{user_id}/entry/{entry_id}/servings")
def update_entry_servings(
    user_id: str,
    entry_id: int,
    body: dict,
    conn: Any = Depends(get_db),
) -> dict:
    servings = max(1, min(10, int(body.get("servings", 1))))
    conn.execute(
        "UPDATE meal_plans SET servings = ? WHERE id = ? AND user_id = ?",
        (servings, entry_id, user_id),
    )
    conn.commit()
    return {"success": True, "servings": servings}


@router.delete("/{user_id}/clear")
def clear_week_meal_plan(
    user_id: str,
    weekStart: str | None = None,
    dayIndex: int | None = None,
    conn: Any = Depends(get_db),
) -> dict[str, int | bool]:
    if not weekStart:
        raise HTTPException(status_code=400, detail="weekStart is required")

    if dayIndex is not None:
        rows = conn.execute(
            """
            SELECT id, day_index, meal_type
            FROM meal_plans
            WHERE user_id = ? AND week_start = ? AND day_index = ?
            """,
            (user_id, weekStart, dayIndex),
        ).fetchall()
    else:
        rows = conn.execute(
            """
            SELECT id, day_index, meal_type
            FROM meal_plans
            WHERE user_id = ? AND week_start = ?
            """,
            (user_id, weekStart),
        ).fetchall()

    removable_ids = [
        int(row["id"])
        for row in rows
        if not _is_slot_locked(weekStart, int(row["day_index"]), str(row["meal_type"]))
    ]

    removed = 0
    for entry_id in removable_ids:
        conn.execute("DELETE FROM meal_plans WHERE id = ? AND user_id = ?", (entry_id, user_id))
        removed += 1

    conn.commit()
    return {"success": True, "removed": removed}


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
        SELECT mp.*, r.ingredients, r.servings AS recipe_servings,
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
        SELECT mp.*, r.ingredients, r.servings AS recipe_servings,
               r.calories, r.protein, r.total_carbs AS carbs, r.fat, r.fiber, r.sodium, r.cholesterol, r.sugar
        FROM meal_plans mp
        JOIN recipes r ON (r.id::text = mp.dish_id OR ('r' || r.id::text) = mp.dish_id)
        WHERE mp.user_id = ? AND mp.week_start = ? AND mp.day_index = ?
        """,
        (user_id, ws, day_index),
    ).fetchall()

    ingredient_cache = load_ingredient_cache(conn)
    return get_day_nutrients(entries, ingredient_cache)


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


def _build_autofill_fixed_assignments(
    existing: list[dict[str, Any]],
) -> tuple[list[FixedMealAssignment], dict[tuple[int, str], list[dict[str, Any]]]]:
    occupied: dict[tuple[int, str], list[dict[str, Any]]] = {}
    fixed_assignments: list[FixedMealAssignment] = []

    for entry in existing:
        key = (int(entry["day_index"]), str(entry["meal_type"]))
        occupied.setdefault(key, []).append(entry)
        fixed_assignments.append(
            FixedMealAssignment(
                day_index=int(entry["day_index"]),
                meal_type=str(entry["meal_type"]),
                recipe_id=str(entry["dish_id"]).removeprefix("r"),
                servings=float(entry.get("servings") or 1.0),
            )
        )

    return fixed_assignments, occupied


def _autofill_violation(
    *,
    code: str,
    title: str,
    message: str,
    day_index: int,
    meal_type: str | None = None,
    recipe_ids: list[str] | None = None,
    actual: float | None = None,
    limit: float | None = None,
) -> AutofillConstraintViolation:
    return AutofillConstraintViolation(
        code=code,
        title=title,
        message=message,
        dayIndex=day_index,
        mealType=meal_type,
        recipeIds=list(recipe_ids or []),
        actual=actual,
        limit=limit,
    )


def _validate_fixed_assignments_for_autofill(
    existing: list[dict[str, Any]],
    *,
    settings: Any,
    targets: dict[str, float],
) -> list[AutofillConstraintViolation]:
    violations: list[AutofillConstraintViolation] = []
    slot_entries: dict[tuple[int, str], list[dict[str, Any]]] = {}
    day_totals: dict[int, dict[str, float]] = {}

    for entry in existing:
        day_index = int(entry["day_index"])
        meal_type = str(entry["meal_type"])
        slot_entries.setdefault((day_index, meal_type), []).append(entry)
        totals = day_totals.setdefault(day_index, {"calories": 0.0, "protein": 0.0, "carbs": 0.0, "fat": 0.0})
        servings = parse_float(entry.get("servings"), 1.0)
        for nutrient in totals:
            totals[nutrient] += parse_float(entry.get(nutrient), 0.0) * servings

    nutrient_caps = {
        "calories": settings.maxCalories,
        "carbs": settings.maxCarbs,
        "fat": settings.maxFat,
    }

    for (day_index, meal_type), entries in sorted(slot_entries.items()):
        dish_ids = [str(entry["dish_id"]).removeprefix("r") for entry in entries]
        recipes = [
            normalize_recipe(
                {
                    **dict(entry),
                    "recipe_id": str(entry.get("dish_id") or entry.get("recipe_id") or entry.get("id") or ""),
                }
            )
            for entry in entries
        ]

        slot_max = _max_dishes_for_meal(_resolve_max_dishes(settings.maxDishesPerSlot), meal_type)
        if len(entries) > slot_max:
            violations.append(
                _autofill_violation(
                    code="too_many_recipes_in_slot",
                    title="Too many dishes in one slot",
                    message=(
                        f"Day {day_index + 1} {meal_type} already has {len(entries)} dishes, "
                        f"which exceeds the slot limit of {slot_max}."
                    ),
                    day_index=day_index,
                    meal_type=meal_type,
                    recipe_ids=dish_ids,
                    actual=float(len(entries)),
                    limit=float(slot_max),
                )
            )

        for recipe in recipes:
            if meal_type not in recipe.meal_types:
                violations.append(
                    _autofill_violation(
                        code="dish_not_allowed_for_meal",
                        title="Dish does not match meal type",
                        message=(
                            f"Day {day_index + 1} {meal_type} contains '{recipe.name}', "
                            f"which is not classified for {meal_type}."
                        ),
                        day_index=day_index,
                        meal_type=meal_type,
                        recipe_ids=[recipe.recipe_id],
                    )
                )

        if meal_type in ("lunch", "dinner") and recipes and not any(recipe.is_main_course for recipe in recipes):
            violations.append(
                _autofill_violation(
                    code="missing_main_course",
                    title="Missing main course",
                    message=f"Day {day_index + 1} {meal_type} does not include a main course.",
                    day_index=day_index,
                    meal_type=meal_type,
                    recipe_ids=dish_ids,
                )
            )

        for nutrient, cap in nutrient_caps.items():
            if cap is None:
                continue
            actual = sum(
                parse_float(entry.get(nutrient), 0.0) * parse_float(entry.get("servings"), 1.0)
                for entry in entries
            )
            if actual > float(cap):
                violations.append(
                    _autofill_violation(
                        code=f"meal_{nutrient}_cap_exceeded",
                        title=f"{nutrient.capitalize()} cap exceeded for meal",
                        message=(
                            f"Day {day_index + 1} {meal_type} totals {actual:.1f} {nutrient}, "
                            f"above the slot cap of {float(cap):.1f}."
                        ),
                        day_index=day_index,
                        meal_type=meal_type,
                        recipe_ids=dish_ids,
                        actual=round(actual, 1),
                        limit=float(cap),
                    )
                )

    for day_index, totals in sorted(day_totals.items()):
        for nutrient, target in targets.items():
            actual = totals.get(nutrient)
            if actual is None or actual <= float(target):
                continue
            violations.append(
                _autofill_violation(
                    code=f"daily_{nutrient}_cap_exceeded",
                    title=f"Daily {nutrient} cap exceeded",
                    message=(
                        f"Day {day_index + 1} already totals {actual:.1f} {nutrient}, "
                        f"above the daily target of {float(target):.1f}."
                    ),
                    day_index=day_index,
                    recipe_ids=[],
                    actual=round(actual, 1),
                    limit=float(target),
                )
            )

    return violations


def _build_autofill_insert_rows(
    *,
    generated: Any,
    user_id: str,
    week_start: str,
    occupied: dict[tuple[int, str], list[dict[str, Any]]],
    settings: Any,
) -> list[dict[str, Any]]:
    item_rows: list[dict[str, Any]] = []

    for day_index in range(generated.selected_plan.num_days):
        for meal_type in AUTOFILL_MEAL_TYPES:
            slot_key = (day_index, meal_type)
            picks = list(generated.selected_plan.picks[day_index].get(meal_type, []))
            print(
                f"[autofill] solver_slot day={day_index} meal={meal_type} "
                f"dish_ids={[pick.recipe_id for pick in picks]}"
            )
            if _is_slot_locked(week_start, day_index, meal_type):
                continue
            if occupied.get(slot_key):
                continue
            meal_max = _max_dishes_for_meal(_resolve_max_dishes(settings.maxDishesPerSlot), meal_type)
            if meal_max < 1:
                continue

            if not picks:
                continue

            for entry_order, pick in enumerate(picks[:meal_max]):
                item_rows.append(
                    {
                        "id": None,
                        "meal_plan_id": None,
                        "user_id": user_id,
                        "week_start": week_start,
                        "day_index": day_index,
                        "meal_type": meal_type,
                        "dish_id": pick.recipe_id,
                        "servings": pick.servings,
                        "custom_ingredients": None,
                        "entry_order": entry_order,
                    }
                )

    return item_rows


def _targets_from_autofill_thresholds(body: AutofillBody) -> dict[str, float]:
    targets: dict[str, float] = {}
    for item in body.thresholds:
        key = str(item.nutrientKey)
        if item.dailyValue is not None:
            targets[key] = float(item.dailyValue)
        elif item.perMealValue is not None:
            targets[key] = float(item.perMealValue) * 3.0

    required = ("calories", "protein", "carbs", "fat")
    missing = [key for key in required if targets.get(key, 0.0) <= 0]
    if missing:
        print(
            "[autofill] threshold_parse_error "
            f"thresholds={[{'nutrientKey': t.nutrientKey, 'dailyValue': t.dailyValue, 'perMealValue': t.perMealValue} for t in body.thresholds]} "
            f"parsed_targets={targets} missing={missing}"
        )
        raise HTTPException(
            status_code=400,
            detail=f"Autofill thresholds are missing required targets: {missing}",
        )
    return targets


def _log_visible_week_plan(
    conn: Any,
    *,
    user_id: str,
    week_start: str,
) -> None:
    rows = conn.execute(
        """
        SELECT day_index, meal_type, dish_id
        FROM meal_plans
        WHERE user_id = ? AND week_start = ?
        ORDER BY day_index, meal_type, entry_order
        """,
        (user_id, week_start),
    ).fetchall()

    slots: dict[tuple[int, str], list[str]] = {}
    for row in rows:
        key = (int(row["day_index"]), str(row["meal_type"]))
        slots.setdefault(key, []).append(str(row["dish_id"]))

    for day_index in range(7):
        for meal_type in AUTOFILL_MEAL_TYPES:
            dish_ids = slots.get((day_index, meal_type), [])
            print(f"[autofill] visible_slot day={day_index} meal={meal_type} dish_ids={dish_ids}")


@router.post("/{user_id}/autofill/validate", response_model=AutofillValidationResponse)
def validate_autofill_plan(
    user_id: str,
    body: AutofillBody,
    _: str = Depends(require_paid_tier),
    conn: Any = Depends(get_db),
) -> AutofillValidationResponse:
    if not body.weekStart:
        raise HTTPException(status_code=400, detail="weekStart is required for autofill")
    targets_override = _targets_from_autofill_thresholds(body)
    existing = conn.execute(
        """
        SELECT mp.*, r.name, r.category, r.keywords, r.ingredients,
               r.calories, r.protein, r.total_carbs AS carbs, r.fat, r.fiber, r.sodium, r.cholesterol, r.sugar
        FROM meal_plans mp
        JOIN recipes r ON (r.id::text = mp.dish_id OR ('r' || r.id::text) = mp.dish_id)
        WHERE mp.user_id = ? AND mp.week_start = ?
        ORDER BY mp.day_index, mp.meal_type, mp.entry_order
        """,
        (user_id, body.weekStart),
    ).fetchall()
    violations = _validate_fixed_assignments_for_autofill(
        existing,
        settings=body.settings,
        targets=targets_override,
    )
    return AutofillValidationResponse(
        canProceed=len(violations) == 0,
        violations=violations,
    )


@router.post("/{user_id}/autofill")
def autofill_plan(
    user_id: str,
    body: AutofillBody,
    _: str = Depends(require_paid_tier),
    conn: Any = Depends(get_db),
) -> dict:
    if not body.weekStart:
        raise HTTPException(status_code=400, detail="weekStart is required for autofill")
    ws = body.weekStart
    settings = body.settings
    targets_override = _targets_from_autofill_thresholds(body)
    print(f"[autofill] start user_id={user_id} week_start={ws}")
    print(f"[autofill] parsed_targets={targets_override}")

    user_profile = _load_profile_for_plan(conn, user_id)
    if not user_profile:
        return {"success": False, "added": 0, "error": "User not found"}

    existing = conn.execute(
        """
        SELECT mp.*, r.name, r.category, r.keywords, r.ingredients,
               r.calories, r.protein, r.total_carbs AS carbs, r.fat, r.fiber, r.sodium, r.cholesterol, r.sugar
        FROM meal_plans mp
        JOIN recipes r ON (r.id::text = mp.dish_id OR ('r' || r.id::text) = mp.dish_id)
        WHERE mp.user_id = ? AND mp.week_start = ?
        ORDER BY mp.day_index, mp.meal_type, mp.entry_order
        """,
        (user_id, ws),
    ).fetchall()

    violations = _validate_fixed_assignments_for_autofill(
        existing,
        settings=settings,
        targets=targets_override,
    )
    if violations and not body.allowConstraintRelaxation:
        print(
            f"[autofill] validation_blocked user_id={user_id} week_start={ws} "
            f"violation_codes={[violation.code for violation in violations]}"
        )
        raise HTTPException(
            status_code=409,
            detail={
                "error": "Existing meal plan violates hard constraints.",
                "violations": jsonable_encoder(violations),
            },
        )

    try:
        fixed_assignments, occupied = _build_autofill_fixed_assignments(existing)
        print(
            f"[autofill] existing_slots={len(occupied)} fixed_assignments={len(fixed_assignments)} "
            f"settings=maxDishesPerSlot:{settings.maxDishesPerSlot},maxCalories:{settings.maxCalories},"
            f"maxCarbs:{settings.maxCarbs},maxFat:{settings.maxFat}"
        )
        meal_ratio = settings.mealCalorieRatio or DEFAULT_MEAL_CALORIE_RATIO
        generated = generate_meal_plan_for_week(
            conn,
            patient_id=user_id,
            week_start=ws,
            config=SolverConfig(
                num_days=7,
                max_solutions=1,
                time_limit_seconds=5,
                max_recipes_per_meal=_resolve_max_dishes(settings.maxDishesPerSlot),
                meal_calorie_ratio=meal_ratio,
                per_meal_nutrient_caps={
                    key: value
                    for key, value in {
                        "calories": settings.maxCalories,
                        "carbs": settings.maxCarbs,
                        "fat": settings.maxFat,
                    }.items()
                    if value is not None
                },
            ),
            fixed_assignments=fixed_assignments,
            targets_override=targets_override,
        )
        print(
            f"[autofill] solver_success user_id={user_id} week_start={ws} "
            f"objective={generated.selected_plan.objective_value:.2f}"
        )
    except ValueError as exc:
        detail = str(exc)
        print(f"[autofill] solver_value_error user_id={user_id} week_start={ws} detail={detail}")
        status = 404 if "not found" in detail.lower() else 400
        raise HTTPException(status_code=status, detail=detail) from exc
    except RuntimeError as exc:
        print(f"[autofill] solver_runtime_error user_id={user_id} week_start={ws} detail={exc}")
        raise HTTPException(status_code=422, detail=str(exc)) from exc

    item_rows = _build_autofill_insert_rows(
        generated=generated,
        user_id=user_id,
        week_start=ws,
        occupied=occupied,
        settings=settings,
    )

    saved_rows = []
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
    print(f"[autofill] inserted_rows={len(saved_rows)} user_id={user_id} week_start={ws}")
    _log_visible_week_plan(conn, user_id=user_id, week_start=ws)
    return {"success": True, "added": len(saved_rows)}


@router.post("/{user_id}/generate")
def generate_plan(
    user_id: str,
    body: GeneratePlanBody,
    conn: Any = Depends(get_db),
) -> dict:
    ws = body.weekStart or get_current_week_start()
    target_day = body.dayIndex  # None = all days, int = single day

    num_days = 1 if target_day is not None else min(body.numDays, 7)

    resolved_dishes = _resolve_max_dishes(body.maxDishesPerSlot)
    config = SolverConfig(
        num_days=num_days,
        time_limit_seconds=min(body.timeLimitSeconds, 120) if target_day is None else 5,
        max_recipes_per_meal=resolved_dishes,
    )

    print(
        f"[generate] user_id={user_id} week_start={ws} target_day={target_day} "
        f"num_days={num_days} maxDishesPerSlot={body.maxDishesPerSlot} "
        f"resolved={resolved_dishes} time_limit={config.time_limit_seconds}s"
    )

    # User-set nutrient limits override the profile-derived targets
    targets_override = None
    if body.nutrientLimits:
        targets_override = {k: float(v) for k, v in body.nutrientLimits.items() if v}
        print(f"[generate] nutrient_limits_override={targets_override}")

    try:
        result = generate_meal_plan_for_week(
            conn,
            patient_id=user_id,
            week_start=ws,
            config=config,
            fixed_assignments=None,
            exclude_recipe_ids=None,
            targets_override=targets_override,
        )
        print(
            f"[generate] success entries={len(result.entries)} "
            f"objective={result.selected_plan.objective_value:.2f}"
        )
    except (ValueError, RuntimeError) as exc:
        print(f"[generate] solver_error: {exc}")
        return {"success": False, "error": str(exc)}

    # For the target day(s), clear ALL existing entries first to prevent duplicates,
    # then insert the new plan entries.
    if target_day is not None:
        conn.execute(
            "DELETE FROM meal_plans WHERE user_id = ? AND week_start = ? AND day_index = ?",
            (user_id, ws, target_day),
        )
    else:
        conn.execute(
            "DELETE FROM meal_plans WHERE user_id = ? AND week_start = ?",
            (user_id, ws),
        )

    entries_written = 0
    for entry in result.entries:
        actual_day = (target_day if target_day is not None else entry.day_index)
        conn.execute(
            "INSERT INTO meal_plans (user_id, week_start, day_index, meal_type, dish_id, servings, entry_order) VALUES (?, ?, ?, ?, ?, ?, ?)",
            (user_id, ws, actual_day, entry.meal_type, entry.recipe_id, entry.servings, entry.entry_order),
        )
        entries_written += 1

    conn.commit()

    return {
        "success": True,
        "entriesWritten": entries_written,
        "totalSlots": config.num_days * len(SOLVER_MEALS),
    }
