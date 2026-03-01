from __future__ import annotations

import sqlite3
from typing import Any

from ..constants import NUTRIENT_KEYS, RDA
from ..utils import parse_json


def _blank_nutrients() -> dict[str, float]:
    return {k: 0.0 for k in NUTRIENT_KEYS}


def load_ingredient_cache(conn: sqlite3.Connection) -> dict[str, list[float]]:
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


def get_row_nutrients(row: sqlite3.Row | dict[str, Any], servings: float = 1.0) -> dict[str, float]:
    # Uses direct per-dish nutrients loaded from recipes_nlp_tagged.csv.
    s = float(servings)

    def _get(name: str) -> float:
        if isinstance(row, sqlite3.Row):
            val = row[name] if name in row.keys() else 0
            return float(val or 0)
        return float(row.get(name, 0) or 0)

    nutrients = {
        "calories": _get("calories") * s,
        "protein": _get("protein") * s,
        "carbs": _get("carbs") * s,
        "fat": _get("fat") * s,
        "fiber": _get("fiber") * s,
        "sodium": _get("sodium") * s,
        "cholesterol": _get("cholesterol") * s,
        "sugar": _get("sugar") * s,
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
    entry: sqlite3.Row | dict[str, Any],
    ingredient_cache: dict[str, list[float]],
) -> dict[str, float]:
    ingredients = entry["ingredients"] if isinstance(entry, sqlite3.Row) else entry.get("ingredients")
    custom_ingredients = (
        entry["custom_ingredients"] if isinstance(entry, sqlite3.Row) else entry.get("custom_ingredients")
    )
    servings = entry["servings"] if isinstance(entry, sqlite3.Row) else entry.get("servings", 1)

    has_direct = False
    if isinstance(entry, sqlite3.Row):
        keys = set(entry.keys())
        has_direct = all(key in keys for key in ["calories", "protein", "carbs", "fat", "fiber", "sodium", "cholesterol", "sugar"])
    else:
        has_direct = all(key in entry for key in ["calories", "protein", "carbs", "fat", "fiber", "sodium", "cholesterol", "sugar"])

    if has_direct and not parse_json(custom_ingredients, None):
        return get_row_nutrients(entry, servings)

    return get_dish_nutrients(ingredients, ingredient_cache, servings, custom_ingredients)


def get_day_nutrients(
    entries: list[sqlite3.Row | dict[str, Any]],
    ingredient_cache: dict[str, list[float]],
) -> dict[str, float]:
    totals = _blank_nutrients()
    for entry in entries:
        dn = get_entry_nutrients(entry, ingredient_cache)
        for key in NUTRIENT_KEYS:
            totals[key] += dn[key]
    return {k: round(v, 1) for k, v in totals.items()}


def get_week_nutrients(
    entries: list[sqlite3.Row | dict[str, Any]],
    ingredient_cache: dict[str, list[float]],
) -> dict[str, float]:
    return get_day_nutrients(entries, ingredient_cache)


def week_rda() -> dict[str, float]:
    return {k: RDA[k] * 7 for k in NUTRIENT_KEYS}
