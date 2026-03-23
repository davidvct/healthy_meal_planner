"""Unified dish data model used across the scorer, filter, and solver pipeline.

``DishCandidate`` replaces the three separate dict-building adapters:
- ``_recipe_to_dish_row()`` in ``routers/dishes.py``
- ``_recipe_to_filterable_dish_row()`` in ``services/inputs.py``
- ``_recipe_to_filterable_dish_row()`` in ``services/solver/inputs.py``

All attributes are native Python types (no JSON strings), so callers no longer
need to call ``parse_json`` before accessing fields.
"""
from __future__ import annotations

from dataclasses import dataclass
from typing import Any

from ..utils import parse_float, parse_ingredients_map, parse_json, parse_servings_yield


# ---------------------------------------------------------------------------
# Tag / category helpers (shared, not exported publicly)
# ---------------------------------------------------------------------------

def _parse_csv_words(value: Any) -> list[str]:
    return [item.strip().lower() for item in str(value or "").split(",") if item.strip()]


def _build_tags(row: dict[str, Any]) -> tuple[str, ...]:
    tags: list[str] = []
    for col in ("cuisine", "category", "keywords"):
        tags.extend(_parse_csv_words(row.get(col, "")))
    for tag, col in (
        ("vegetarian", "is_vegetarian"),
        ("vegan", "is_vegan"),
        ("gluten_free", "is_gluten_free"),
        ("dairy_free", "is_dairy_free"),
        ("low_carb", "is_low_carb"),
        ("high_protein", "is_high_protein"),
        ("spicy", "is_spicy"),
        ("sweet", "is_sweet"),
        ("salty", "is_salty"),
    ):
        if row.get(col):
            tags.append(tag)
    cleaned: list[str] = []
    for tag in tags:
        normalized = str(tag).strip().lower().replace(" ", "_")
        if normalized and normalized not in cleaned:
            cleaned.append(normalized)
    return tuple(cleaned)


def _build_diet_label(row: dict[str, Any]) -> str:
    habits = str(row.get("dietary_habits") or "").strip().lower()
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


def _derive_meal_types(category: str) -> tuple[str, ...]:
    text = (category or "").strip().lower()
    meal_types: list[str] = []
    if "breakfast" in text:
        meal_types.append("breakfast")
    if "lunch" in text:
        meal_types.append("lunch")
    if "dinner" in text:
        meal_types.append("dinner")
    if any(token in text for token in ("main", "entree", "soup", "salad", "side")):
        meal_types.extend(["lunch", "dinner"])
    if any(token in text for token in ("appetizer", "dessert", "beverage", "drink")):
        meal_types.extend(["lunch", "dinner", "snack"])
    if "snack" in text:
        meal_types.append("snack")
    if not meal_types:
        meal_types = ["lunch", "dinner"]
    return tuple(dict.fromkeys(meal_types))


_CONDIMENT_TOKENS = (
    "sauce", "dressing", "dip", "condiment", "marinade", "spread",
    "salsa", "gravy", "chutney", "relish", "vinaigrette", "glaze",
    "frosting", "icing", "jam", "jelly", "pesto", "mayonnaise",
    "ketchup", "mustard",
)


# ---------------------------------------------------------------------------
# Public API
# ---------------------------------------------------------------------------

@dataclass(frozen=True)
class DishCandidate:
    """Normalised view of a recipe row, ready for filtering, scoring, and solving."""

    id: str
    name: str
    category: str
    meal_types: tuple[str, ...]
    is_main_course: bool
    is_side_dish: bool
    tags: tuple[str, ...]
    ingredients: dict[str, float]
    allergies: tuple[str, ...]
    diet_label: str
    # Nutrients
    calories: float
    protein: float
    carbs: float
    fat: float
    fiber: float
    sodium: float
    cholesterol: float
    sugar: float
    # Condition-suitability labels (NLP-tagged, may be None)
    hypertension_category: str | None
    diabetes_category: str | None
    cholesterol_category: str | None
    gout_category: str | None
    # Personalisation flag — set to True after checking the favourites table
    is_favourite: bool = False
    url: str = ""


def build_dish_candidate(row: dict[str, Any], *, is_favourite: bool = False) -> DishCandidate:
    """Build a ``DishCandidate`` from a raw database recipe row."""
    recipe_id = str(row.get("id") or "")
    category = str(row.get("category") or "")

    # Respect stored meal_types if available; otherwise infer from category
    raw_meal_types = row.get("meal_types") or row.get("mealTypes")
    if raw_meal_types is not None:
        parsed = parse_json(raw_meal_types, None)
        if isinstance(parsed, list):
            meal_types = tuple(dict.fromkeys(str(m).strip().lower() for m in parsed if str(m).strip()))
        elif isinstance(raw_meal_types, (list, tuple)):
            meal_types = tuple(dict.fromkeys(str(m).strip().lower() for m in raw_meal_types if str(m).strip()))
        else:
            meal_types = _derive_meal_types(category)
    else:
        meal_types = _derive_meal_types(category)

    category_lc = category.strip().lower()
    tags = _build_tags(row)
    is_main_course = bool(row.get("is_main_course")) or any(
        kw in category_lc for kw in ("main course", "main", "entree")
    ) or any(tag in {"main_course", "main", "entree"} for tag in tags)
    is_side_dish = bool(row.get("is_side_dish")) or any(
        kw in category_lc for kw in ("side dish", "side")
    ) or any(tag in {"side_dish", "side"} for tag in tags)

    ingredients = parse_ingredients_map(row.get("ingredients"))
    allergies = tuple(_parse_csv_words(row.get("allergies") or ""))
    sy = float(parse_servings_yield(row.get("servings")))

    return DishCandidate(
        id=recipe_id,
        name=str(row.get("name") or f"Recipe {recipe_id}"),
        category=category,
        meal_types=meal_types,
        is_main_course=is_main_course,
        is_side_dish=is_side_dish,
        tags=tags,
        ingredients=ingredients,
        allergies=allergies,
        diet_label=_build_diet_label(row),
        calories=round(parse_float(row.get("calories"), 0.0) / sy, 1),
        protein=round(parse_float(row.get("protein"), 0.0) / sy, 1),
        carbs=round(parse_float(row.get("total_carbs", row.get("carbs")), 0.0) / sy, 1),
        fat=round(parse_float(row.get("fat"), 0.0) / sy, 1),
        fiber=round(parse_float(row.get("fiber"), 0.0) / sy, 1),
        sodium=round(parse_float(row.get("sodium"), 0.0) / sy, 1),
        cholesterol=round(parse_float(row.get("cholesterol"), 0.0) / sy, 1),
        sugar=round(parse_float(row.get("sugar"), 0.0) / sy, 1),
        hypertension_category=row.get("hypertension_category"),
        diabetes_category=row.get("diabetes_category"),
        cholesterol_category=row.get("cholesterol_category"),
        gout_category=row.get("gout_category"),
        is_favourite=is_favourite,
        url=str(row.get("url") or ""),
    )


def is_condiment_like(dish: DishCandidate) -> bool:
    """Return True if the dish looks like a condiment/sauce/dip that should be
    excluded from main meal slots."""
    text = f"{dish.name} {dish.category} {' '.join(dish.tags)}".lower()
    return any(token in text for token in _CONDIMENT_TOKENS)
