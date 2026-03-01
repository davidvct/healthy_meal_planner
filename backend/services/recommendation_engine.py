from __future__ import annotations

import sqlite3
from typing import Any

from ..constants import CONDITION_RULES, NUTRIENT_KEYS, RDA
from ..utils import parse_json
from .nutrient_calculator import get_day_nutrients, get_entry_nutrients, get_row_nutrients

_CONDITION_CATEGORY_COLUMN = {
    "Hypertension": "hypertension_category",
    "High Blood Sugar": "diabetes_category",
    "High Cholesterol": "cholesterol_category",
}


def _condition_category_score(value: str | None) -> float:
    text = (value or "").strip().lower()
    if "avoid" in text:
        return -30.0
    if "caution" in text:
        return -12.0
    if "moderation" in text:
        return -6.0
    if "suitable" in text:
        return 6.0
    return 0.0


def get_warnings(
    nutrients: dict[str, float],
    conditions: list[str],
    dish: sqlite3.Row | dict[str, Any] | None = None,
) -> list[str]:
    warnings: list[str] = []
    for condition in conditions:
        category_col = _CONDITION_CATEGORY_COLUMN.get(condition)
        if dish and category_col:
            value = dish[category_col] if isinstance(dish, sqlite3.Row) else dish.get(category_col)
            category_text = (value or "").strip().lower()
            if "avoid" in category_text or "caution" in category_text:
                warnings.append(f"{condition}: {value}")

        rule = CONDITION_RULES.get(condition)
        if not rule:
            continue
        for nutrient, limit in rule["limit"].items():
            if nutrients.get(nutrient, 0) > limit:
                warnings.append(rule["warnLabel"])
                break
    return list(dict.fromkeys(warnings))


def score_dish(
    dish: sqlite3.Row | dict[str, Any],
    user_conditions: list[str],
    day_entries: list[sqlite3.Row],
    meal_type: str,
    all_week_entries: list[sqlite3.Row],
    ingredient_cache: dict[str, list[float]],
) -> dict[str, int]:
    dish_id = dish["id"] if isinstance(dish, sqlite3.Row) else dish.get("id")
    meal_types = parse_json(
        dish["meal_types"] if isinstance(dish, sqlite3.Row) else (dish.get("meal_types") or dish.get("mealTypes")),
        [],
    )

    dn = get_row_nutrients(dish)
    day_n = get_day_nutrients(day_entries, ingredient_cache)

    health_score = 60.0
    for condition in user_conditions:
        category_col = _CONDITION_CATEGORY_COLUMN.get(condition)
        if category_col:
            category_val = dish[category_col] if isinstance(dish, sqlite3.Row) else dish.get(category_col)
            health_score += _condition_category_score(category_val)

        rule = CONDITION_RULES.get(condition)
        if not rule:
            continue
        for nutrient, limit in rule["limit"].items():
            ratio = dn.get(nutrient, 0) / limit if limit else 0
            if ratio > 1.2:
                health_score -= 24
            elif ratio > 0.8:
                health_score -= 10
    health_score = max(0, min(70, health_score))

    remaining = {k: max(0, RDA[k] - day_n[k]) for k in NUTRIENT_KEYS}

    nutrient_score = 0.0
    for key in ["protein", "fiber", "calories"]:
        if remaining[key] > 0:
            fill_ratio = min(1, dn[key] / (remaining[key] * 0.4))
            nutrient_score += fill_ratio * 7

    for key in ["sodium", "cholesterol", "sugar"]:
        headroom = remaining[key]
        if headroom > 0 and dn[key] <= headroom:
            nutrient_score += 3
        elif dn[key] > headroom * 1.2:
            nutrient_score -= 2

    nutrient_score = max(0, min(30, nutrient_score))

    pref_score = 0.0
    count = len([entry for entry in all_week_entries if entry["dish_id"] == dish_id])
    pref_score += max(0, 5 - count * 2)
    pref_score += 5 if meal_type in meal_types else 1

    total = round(max(0, min(100, health_score + nutrient_score + pref_score)))
    return {
        "total": int(total),
        "healthScore": int(round(health_score)),
        "nutrientScore": int(round(nutrient_score)),
        "prefScore": int(round(pref_score)),
    }


def filter_dishes(
    dishes: list[sqlite3.Row],
    user_profile: dict[str, Any],
    meal_type: str,
    ingredient_cache: dict[str, list[float]],
    *,
    filter_meal_type: bool = True,
    filter_diet: bool = True,
    filter_allergies: bool = True,
    filter_conditions: bool = True,
) -> list[sqlite3.Row]:
    filtered: list[sqlite3.Row] = []

    for dish in dishes:
        ingredients = parse_json(dish["ingredients"], {})
        tags = parse_json(dish["tags"], [])
        meal_types = parse_json(dish["meal_types"], [])
        dish_allergies = parse_json(dish["allergies"], [])

        if filter_allergies and user_profile.get("allergies"):
            allergies = {a.strip().lower() for a in user_profile.get("allergies", [])}
            ingredient_hits = {ing.strip().lower() for ing in ingredients.keys()}
            tagged_hits = {a.strip().lower() for a in dish_allergies}
            if allergies.intersection(ingredient_hits) or allergies.intersection(tagged_hits):
                continue

        if filter_diet and user_profile.get("diet") != "none":
            diet = (user_profile.get("diet") or "none").strip().lower()
            dish_diet = (dish["diet_label"] or "none").strip().lower()
            if diet == "vegetarian" and "vegetarian" not in tags and dish_diet not in {"vegetarian", "vegan"}:
                continue
            if diet == "vegan" and "vegan" not in tags and dish_diet != "vegan":
                continue
            if diet == "pescatarian" and any(x in ingredients for x in ["beef", "pork", "chicken", "lamb", "turkey"]):
                continue
            if diet == "halal" and any(x in ingredients for x in ["pork", "ham", "bacon", "lard"]):
                continue

        if filter_meal_type and meal_type not in meal_types:
            continue

        if filter_conditions and user_profile.get("conditions"):
            blocked = False
            for condition in user_profile["conditions"]:
                category_col = _CONDITION_CATEGORY_COLUMN.get(condition)
                if not category_col:
                    continue
                category_text = (dish[category_col] or "").strip().lower()
                if "avoid" in category_text:
                    blocked = True
                    break
            if blocked:
                continue

            nutrients = get_row_nutrients(dish)
            if get_warnings(nutrients, user_profile["conditions"], dish):
                # Keep "caution" dishes but remove extreme offenders by nutrient threshold.
                severe = False
                for condition in user_profile["conditions"]:
                    rule = CONDITION_RULES.get(condition)
                    if not rule:
                        continue
                    for nutrient, limit in rule["limit"].items():
                        if nutrients.get(nutrient, 0) > limit * 2.0:
                            severe = True
                            break
                    if severe:
                        break
                if severe:
                    continue

        filtered.append(dish)

    return filtered


def get_entry_warnings(
    entry: sqlite3.Row,
    dish_ingredients: str | dict[str, float],
    conditions: list[str],
    ingredient_cache: dict[str, list[float]],
) -> list[str]:
    nutrients = get_entry_nutrients(entry, ingredient_cache)
    return get_warnings(nutrients, conditions)
