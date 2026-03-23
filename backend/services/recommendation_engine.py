from __future__ import annotations

from typing import Any

from ..constants import CONDITION_CONFIG, CONDITION_RULES, NUTRIENT_KEYS, RDA
from ..utils import parse_json
from .nutrient_calculator import get_day_nutrients, get_entry_nutrients, get_row_nutrients


# ---------------------------------------------------------------------------
# Internal helpers
# ---------------------------------------------------------------------------

def _dish_get(dish: Any, key: str, default: Any = None) -> Any:
    """Unified field accessor that works for both dict rows and DishCandidate."""
    if isinstance(dish, dict):
        return dish.get(key, default)
    return getattr(dish, key, default)


def condition_category_score(value: str | None) -> float:
    """Map an NLP suitability label to a numeric score contribution.

    ``"avoid"`` → −30, ``"caution"`` → −12, ``"moderation"`` → −6,
    ``"suitable"`` → +6, unknown/None → 0.
    """
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


# Keep the private name for backward compat with any internal callers
_condition_category_score = condition_category_score


def get_warnings(
    nutrients: dict[str, float],
    conditions: list[str],
    dish: Any | None = None,
) -> list[str]:
    warnings: list[str] = []
    for condition in conditions:
        cfg = CONDITION_CONFIG.get(condition)
        if dish and cfg:
            category_col = cfg["category_column"]
            value = _dish_get(dish, category_col)
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
    dish: Any,
    user_conditions: list[str],
    day_entries: list[dict[str, Any]],
    meal_type: str,
    all_week_entries: list[dict[str, Any]],
    ingredient_cache: dict[str, list[float]],
    favourite_ids: set[str] | None = None,
) -> dict[str, int]:
    dish_id = str(_dish_get(dish, "id") or "")
    dish_id_alt = f"r{dish_id}" if not dish_id.startswith("r") else dish_id[1:]

    # meal_types may be a list, tuple, or JSON string
    raw_meal_types = _dish_get(dish, "meal_types") or _dish_get(dish, "mealTypes")
    meal_types = parse_json(raw_meal_types, []) if isinstance(raw_meal_types, (str, bytes)) else (raw_meal_types or [])

    dn = get_row_nutrients(dish)
    day_n = get_day_nutrients(day_entries, ingredient_cache)

    health_score = 60.0
    for condition in user_conditions:
        cfg = CONDITION_CONFIG.get(condition)
        if cfg:
            category_col = cfg["category_column"]
            category_val = _dish_get(dish, category_col)
            health_score += condition_category_score(category_val)

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
    count = len([
        entry for entry in all_week_entries
        if str(entry["dish_id"]) in {dish_id, dish_id_alt}
    ])
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
    "lunch":     {"main course", "soup", "salad", "side dish", "appetizer", "dessert", "beverage", "drink", "sauce", "basics", "condiment"},
    "dinner":    {"main course", "soup", "salad", "side dish", "appetizer", "dessert", "beverage", "drink", "sauce", "basics", "condiment"},
    "snack":     {"snack", "dessert", "appetizer", "beverage", "drink", "smoothie", "dip"},
}


def _category_matches_meal_type(category: str, meal_type: str) -> bool:
    allowed = _MEAL_TYPE_CATEGORY_MAP.get(meal_type)
    if not allowed:
        return True
    cat_lower = category.lower()
    return any(kw in cat_lower for kw in allowed)


def filter_dishes(
    dishes: list[Any],
    user_profile: dict[str, Any],
    meal_type: str,
    ingredient_cache: dict[str, list[float]],
    *,
    filter_meal_type: bool = True,
    filter_diet: bool = True,
    filter_allergies: bool = True,
    filter_conditions: bool = True,
    sub_category: str | None = None,
) -> list[Any]:
    """Filter a list of dish dicts or DishCandidate objects.

    Accepts both legacy dict rows (from ``dishes.py``) and the new
    ``DishCandidate`` objects (from ``solver/inputs.py``).  Field access is
    normalised through ``_dish_get`` so both shapes work transparently.
    """
    filtered: list[Any] = []

    for dish in dishes:
        # --- Resolve fields (dict or DishCandidate) ---
        raw_ingredients = _dish_get(dish, "ingredients", {})
        ingredients: dict[str, float] = (
            parse_json(raw_ingredients, {}) if isinstance(raw_ingredients, (str, bytes))
            else (raw_ingredients or {})
        )
        raw_tags = _dish_get(dish, "tags", [])
        tags: list[str] = (
            parse_json(raw_tags, []) if isinstance(raw_tags, (str, bytes))
            else list(raw_tags or [])
        )
        raw_allergies = _dish_get(dish, "allergies", [])
        dish_allergies: list[str] = (
            parse_json(raw_allergies, []) if isinstance(raw_allergies, (str, bytes))
            else list(raw_allergies or [])
        )
        diet_label = str(_dish_get(dish, "diet_label", "none") or "none")
        category = str(_dish_get(dish, "category", "") or "")

        # --- Allergy filter ---
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

        # --- Diet filter ---
        if filter_diet and user_profile.get("diet") != "none":
            diet = (user_profile.get("diet") or "none").strip().lower()
            dish_diet = diet_label.strip().lower()
            if diet == "vegetarian" and "vegetarian" not in tags and dish_diet not in {"vegetarian", "vegan"}:
                continue
            if diet == "vegan" and "vegan" not in tags and dish_diet != "vegan":
                continue

            ing_keys_lower = " ".join(k.lower() for k in ingredients.keys())
            if diet == "pescatarian" and any(
                x in ing_keys_lower for x in ["beef", "pork", "chicken", "lamb", "turkey", "duck", "veal"]
            ):
                continue
            if diet == "halal" and any(
                x in ing_keys_lower for x in ["pork", "ham", "bacon", "lard", "prosciutto", "pancetta", "chorizo"]
            ):
                continue

        # --- Meal-type filter ---
        if filter_meal_type and not _category_matches_meal_type(category, meal_type):
            continue

        if sub_category and sub_category.lower() not in category.lower():
            continue

        # --- Condition filter ---
        if filter_conditions and user_profile.get("conditions"):
            blocked = False
            for condition in user_profile["conditions"]:
                cfg = CONDITION_CONFIG.get(condition)
                if not cfg:
                    continue
                category_col = cfg["category_column"]
                category_text = str(_dish_get(dish, category_col) or "").strip().lower()
                if "avoid" in category_text:
                    blocked = True
                    break
            if blocked:
                continue

            nutrients = get_row_nutrients(dish)
            if get_warnings(nutrients, user_profile["conditions"], dish):
                # Keep "caution" dishes; only drop severe nutrient offenders.
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
