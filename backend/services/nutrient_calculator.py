from __future__ import annotations

from typing import Any

from ..constants import NUTRIENT_KEYS, RDA
from ..utils import parse_float, parse_json, parse_servings_yield


def _blank_nutrients() -> dict[str, float]:
    return {k: 0.0 for k in NUTRIENT_KEYS}


def load_ingredient_cache(conn: Any) -> dict[str, list[float]]:
    rows = conn.execute("SELECT * FROM ingredients").fetchall()
    cache: dict[str, list[float]] = {}
    for row in rows:
        cache[row["id"]] = [
            row["calories"],
            row["protein_g"],
            row["carbs_g"],
            row["fat_g"],
            row["fiber_g"],
            row["sodium_mg"],
            row["cholesterol_mg"],
            row["sugar_g"],
        ]
    return cache


def get_nutrients_from_ingredients(
    ingredients_obj: dict[str, float], ingredient_cache: dict[str, list[float]]
) -> dict[str, float]:
    nutrients = _blank_nutrients()
    for ingredient, amount_g in ingredients_obj.items():
        nd = ingredient_cache.get(ingredient)
        if not nd:
            continue
        scale = float(amount_g) / 100.0
        for i, key in enumerate(NUTRIENT_KEYS):
            nutrients[key] += nd[i] * scale
    return {k: round(v, 1) for k, v in nutrients.items()}


def get_row_nutrients(row: Any, servings: float = 1.0) -> dict[str, float]:
    """Compute per-entry nutrients from a recipe/meal-plan row.

    DB nutrient values are total-recipe.  We divide by the recipe yield
    (``recipe_servings`` column from JOIN, or ``servings`` on standalone
    recipe rows) to get *per-serving*, then multiply by ``servings``
    (the meal-plan portion count) to get the entry total.
    """
    s = float(servings)

    def _get(name: str) -> float:
        if isinstance(row, dict):
            val = row[name] if name in row.keys() else 0
            return parse_float(val, 0.0)
        return parse_float(getattr(row, name, 0), 0.0)

    # recipe_servings comes from the JOIN (r.servings AS recipe_servings).
    # Fall back to servings for standalone recipe rows (where servings IS the yield).
    if isinstance(row, dict):
        rs_raw = row.get("recipe_servings")
    else:
        rs_raw = getattr(row, "recipe_servings", None)
    recipe_yield = float(parse_servings_yield(rs_raw))

    nutrients = {
        "calories": _get("calories") / recipe_yield * s,
        "protein": _get("protein") / recipe_yield * s,
        "carbs": _get("carbs") / recipe_yield * s,
        "fat": _get("fat") / recipe_yield * s,
        "fiber": _get("fiber") / recipe_yield * s,
        "sodium": _get("sodium") / recipe_yield * s,
        "cholesterol": _get("cholesterol") / recipe_yield * s,
        "sugar": _get("sugar") / recipe_yield * s,
    }
    return {k: round(v, 1) for k, v in nutrients.items()}


def get_dish_nutrients(
    dish_ingredients: dict[str, float] | str,
    ingredient_cache: dict[str, list[float]],
    servings: float = 1.0,
    custom_ingredients: dict[str, float] | str | None = None,
    dish_nutrients: dict[str, float] | None = None,
) -> dict[str, float]:
    custom = parse_json(custom_ingredients, None)
    if custom:
        return get_nutrients_from_ingredients(custom, ingredient_cache)

    if dish_nutrients is not None:
        scaled = {k: float(v or 0) * float(servings) for k, v in dish_nutrients.items()}
        return {k: round(scaled.get(k, 0.0), 1) for k in NUTRIENT_KEYS}

    ingredients = parse_json(dish_ingredients, {})
    scaled = {k: float(v) * float(servings) for k, v in ingredients.items()}
    return get_nutrients_from_ingredients(scaled, ingredient_cache)


def get_entry_nutrients(
    entry: dict[str, Any],
    ingredient_cache: dict[str, list[float]],
) -> dict[str, float]:
    ingredients = entry["ingredients"] if isinstance(entry, dict) else entry.get("ingredients")
    custom_ingredients = (
        entry["custom_ingredients"] if isinstance(entry, dict) else entry.get("custom_ingredients")
    )
    servings = entry["servings"] if isinstance(entry, dict) else entry.get("servings", 1)

    has_direct = False
    if isinstance(entry, dict):
        keys = set(entry.keys())
        has_direct = all(key in keys for key in ["calories", "protein", "carbs", "fat", "fiber", "sodium", "cholesterol", "sugar"])
    else:
        has_direct = all(key in entry for key in ["calories", "protein", "carbs", "fat", "fiber", "sodium", "cholesterol", "sugar"])

    if has_direct and not parse_json(custom_ingredients, None):
        return get_row_nutrients(entry, servings)

    return get_dish_nutrients(ingredients, ingredient_cache, servings, custom_ingredients)


def get_day_nutrients(
    entries: list[dict[str, Any]],
    ingredient_cache: dict[str, list[float]],
) -> dict[str, float]:
    totals = _blank_nutrients()
    for entry in entries:
        dn = get_entry_nutrients(entry, ingredient_cache)
        for key in NUTRIENT_KEYS:
            totals[key] += dn[key]
    return {k: round(v, 1) for k, v in totals.items()}


def get_week_nutrients(
    entries: list[dict[str, Any]],
    ingredient_cache: dict[str, list[float]],
) -> dict[str, float]:
    return get_day_nutrients(entries, ingredient_cache)


def week_rda() -> dict[str, float]:
    return {k: RDA[k] * 7 for k in NUTRIENT_KEYS}


