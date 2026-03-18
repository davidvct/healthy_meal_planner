from __future__ import annotations

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
    dish: dict[str, Any] | None = None,
) -> list[str]:
    warnings: list[str] = []
    for condition in conditions:
        category_col = _CONDITION_CATEGORY_COLUMN.get(condition)
        if dish and category_col:
            value = dish[category_col] if isinstance(dish, dict) else dish.get(category_col)
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
    dish: dict[str, Any],
    user_conditions: list[str],
    day_entries: list[dict[str, Any]],
    meal_type: str,
    all_week_entries: list[dict[str, Any]],
    ingredient_cache: dict[str, list[float]],
    favourite_ids: set[str] | None = None,
) -> dict[str, int]:
    dish_id = str(dish["id"] if isinstance(dish, dict) else dish.get("id"))
    dish_id_alt = f"r{dish_id}" if not dish_id.startswith("r") else dish_id[1:]
    meal_types = parse_json(
        dish["meal_types"] if isinstance(dish, dict) else (dish.get("meal_types") or dish.get("mealTypes")),
        [],
    )

    dn = get_row_nutrients(dish)
    day_n = get_day_nutrients(day_entries, ingredient_cache)

    health_score = 60.0
    for condition in user_conditions:
        category_col = _CONDITION_CATEGORY_COLUMN.get(condition)
        if category_col:
            category_val = dish[category_col] if isinstance(dish, dict) else dish.get(category_col)
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
    count = len(
        [
            entry
            for entry in all_week_entries
            if str(entry["dish_id"]) in {dish_id, dish_id_alt}
        ]
    )
    pref_score += max(0, 5 - count * 2)
    pref_score += 5 if meal_type in meal_types else 1
    if favourite_ids and dish_id in favourite_ids:
        pref_score += 10

    total = round(max(0, min(110, health_score + nutrient_score + pref_score)))
    return {
        "total": int(total),
        "healthScore": int(round(health_score)),
        "nutrientScore": int(round(nutrient_score)),
        "prefScore": int(round(pref_score)),
    }


_MEAL_TYPE_CATEGORY_MAP = {
    "breakfast": {"breakfast"},
    "lunch":     {"main course", "soup", "salad", "side dish", "sauce", "basics", "condiment"},
    "dinner":    {"main course", "soup", "salad", "side dish", "sauce", "basics", "condiment"},
    "snack":     {"snack", "dessert", "appetizer", "beverage", "drink", "smoothie", "dip"},
}


def _category_matches_meal_type(category: str, meal_type: str) -> bool:
    """Check if a recipe's raw category matches the requested meal type."""
    allowed = _MEAL_TYPE_CATEGORY_MAP.get(meal_type)
    if not allowed:
        return True
    cat_lower = category.lower()
    return any(kw in cat_lower for kw in allowed)


def filter_dishes(
    dishes: list[dict[str, Any]],
    user_profile: dict[str, Any],
    meal_type: str,
    ingredient_cache: dict[str, list[float]],
    *,
    filter_meal_type: bool = True,
    filter_diet: bool = True,
    filter_allergies: bool = True,
    filter_conditions: bool = True,
    sub_category: str | None = None,
) -> list[dict[str, Any]]:
    filtered: list[dict[str, Any]] = []

    for dish in dishes:
        ingredients = parse_json(dish["ingredients"], {})
        tags = parse_json(dish["tags"], [])
        dish_allergies = parse_json(dish["allergies"], [])

        if filter_allergies and user_profile.get("allergies"):
            allergies = [a.strip().lower() for a in user_profile.get("allergies", []) if str(a).strip()]
            ingredient_hits = [ing.strip().lower() for ing in ingredients.keys()]
            tagged_hits = [a.strip().lower() for a in dish_allergies]

            def _allergy_match(allergy: str, value: str) -> bool:
                return allergy in value or value in allergy

            blocked = any(
                _allergy_match(allergy, value)
                for allergy in allergies
                for value in [*ingredient_hits, *tagged_hits]
            )
            if blocked:
                continue

        if filter_diet and user_profile.get("diet") != "none":
            diet = (user_profile.get("diet") or "none").strip().lower()
            dish_diet = (dish["diet_label"] or "none").strip().lower()
            if diet == "vegetarian" and "vegetarian" not in tags and dish_diet not in {"vegetarian", "vegan"}:
                continue
            if diet == "vegan" and "vegan" not in tags and dish_diet != "vegan":
                continue

            # Check ingredient keys for substring matches (keys are full strings like "8-10 slices bacon")
            ing_keys_lower = " ".join(k.lower() for k in ingredients.keys())
            if diet == "pescatarian" and any(x in ing_keys_lower for x in ["beef", "pork", "chicken", "lamb", "turkey", "duck", "veal"]):
                continue
            if diet == "halal" and any(x in ing_keys_lower for x in ["pork", "ham", "bacon", "lard", "prosciutto", "pancetta", "chorizo"]):
                continue

        if filter_meal_type and not _category_matches_meal_type(dish.get("category") or "", meal_type):
            continue

        if sub_category and sub_category.lower() not in (dish.get("category") or "").lower():
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
    entry: dict[str, Any],
    dish_ingredients: str | dict[str, float],
    conditions: list[str],
    ingredient_cache: dict[str, list[float]],
) -> list[str]:
    nutrients = get_entry_nutrients(entry, ingredient_cache)
    return get_warnings(nutrients, conditions)


