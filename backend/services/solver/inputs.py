from __future__ import annotations

from typing import Any

from ...data import recommend_targets
from ...utils import parse_float, parse_ingredients_map, parse_json
from .models import (
    MEALS,
    SolverInputBundle,
    SolverInputDiagnostics,
    SolverRecipe,
    _parse_str_list,
    is_condiment_like_record,
    normalize_recipe,
)
from ..nutrient_calculator import load_ingredient_cache
from ..recommendation_engine import filter_dishes


def _parse_csv_words(value: Any) -> list[str]:
    return [item.strip().lower() for item in str(value or "").split(",") if item.strip()]


def _recipe_tags(row: dict[str, Any]) -> list[str]:
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
    return cleaned


def _diet_label(row: dict[str, Any]) -> str:
    habits = str(row.get("dietary_habits") or "").strip().lower()
    if habits:
        return habits
    if row.get("is_vegan"):
        return "vegan"
    if row.get("is_vegetarian"):
        return "vegetarian"
    if row.get("is_low_carb"):
        return "low_carb"
    return "none"


def _recipe_to_filterable_dish_row(recipe: dict[str, Any]) -> dict[str, Any]:
    recipe_id = str(recipe.get("id"))
    ingredients_map = parse_ingredients_map(recipe.get("ingredients"))
    normalized = normalize_recipe(recipe)

    return {
        "id": recipe_id,
        "recipe_id": recipe_id,
        "name": recipe.get("name") or f"Recipe {recipe_id}",
        "category": recipe.get("category") or "",
        "meal_types": list(normalized.meal_types),
        "is_main_course": normalized.is_main_course,
        "is_side_dish": normalized.is_side_dish,
        "tags": _recipe_tags(recipe),
        "ingredients": ingredients_map,
        "allergies": parse_json(recipe.get("allergies"), []),
        "calories": parse_float(recipe.get("calories"), 0.0),
        "protein": parse_float(recipe.get("protein"), 0.0),
        "carbs": parse_float(recipe.get("total_carbs"), 0.0),
        "total_carbs": parse_float(recipe.get("total_carbs"), 0.0),
        "fat": parse_float(recipe.get("fat"), 0.0),
        "fiber": parse_float(recipe.get("fiber"), 0.0),
        "sodium": parse_float(recipe.get("sodium"), 0.0),
        "cholesterol": parse_float(recipe.get("cholesterol"), 0.0),
        "sugar": parse_float(recipe.get("sugar"), 0.0),
        "diet_label": _diet_label(recipe),
        "hypertension_category": recipe.get("hypertension_category"),
        "diabetes_category": recipe.get("diabetes_category"),
        "cholesterol_category": recipe.get("cholesterol_category"),
        "gout_category": recipe.get("gout_category"),
    }


def _load_solver_profile(conn: Any, patient_id: str) -> dict[str, Any] | None:
    uid = str(patient_id or "")

    if uid.startswith("fm:"):
        member_id = uid[3:]
        member = conn.execute("SELECT * FROM family_members WHERE id::text = ?", (member_id,)).fetchone()
        if not member:
            return None
        age = int(parse_float(member.get("age"), 0.0)) if member.get("age") is not None else None
        weight_kg = parse_float(member.get("weight_kg"), 0.0) if member.get("weight_kg") is not None else None
        diet = str(member.get("dietary_prefs") or "none").strip().lower() or "none"
        targets = recommend_targets(age, member.get("sex"), weight_kg, diet)
        return {
            "patient_id": uid,
            "conditions": parse_json(member.get("conditions"), []),
            "diet": diet,
            "allergies": parse_json(member.get("allergies"), []),
            "recommended_calories": targets["calories"],
            "recommended_protein": targets["protein"],
            "recommended_carbs": targets["carbs"],
            "recommended_fat": targets["fat"],
        }

    user = conn.execute("SELECT * FROM users WHERE id = ?", (uid,)).fetchone()
    if not user:
        return None

    age = int(parse_float(user.get("age"), 0.0)) if user.get("age") is not None else None
    weight_kg = parse_float(user.get("weight_kg"), 0.0) if user.get("weight_kg") is not None else None
    diet = str(user.get("diet") or "none").strip().lower() or "none"
    fallback_targets = recommend_targets(age, user.get("sex"), weight_kg, diet)
    return {
        "patient_id": uid,
        "conditions": parse_json(user.get("conditions"), []),
        "diet": diet,
        "allergies": parse_json(user.get("allergies"), []),
        "recommended_calories": parse_float(user.get("recommended_calories"), fallback_targets["calories"]),
        "recommended_protein": parse_float(user.get("recommended_protein"), fallback_targets["protein"]),
        "recommended_carbs": parse_float(user.get("recommended_carbs"), fallback_targets["carbs"]),
        "recommended_fat": parse_float(user.get("recommended_fat"), fallback_targets["fat"]),
    }


# Condition-aware daily nutrient targets
# Columns: protein, carbs, fat, sugar, sodium (daily limits/targets)
_CONDITION_TARGETS = {
    "healthy": {
        "protein": 60.0, "carbs": 275.0, "fat": 65.0,
        "sugar": 50.0, "sodium": 2000.0, "fiber": 25.0,
    },
    "High Blood Sugar": {
        "protein": 65.0, "carbs": 250.0, "fat": 55.0,
        "sugar": 25.0, "sodium": 2000.0, "fiber": 30.0,
    },
    "High Cholesterol": {
        "protein": 60.0, "carbs": 275.0, "fat": 55.0,
        "sugar": 50.0, "sodium": 2000.0, "fiber": 30.0,
    },
    "Hypertension": {
        "protein": 60.0, "carbs": 250.0, "fat": 55.0,
        "sugar": 50.0, "sodium": 1500.0, "fiber": 30.0,
    },
}


def _solver_targets_from_profile(profile: dict[str, Any]) -> dict[str, float]:
    targets = {
        "calories": parse_float(profile.get("recommended_calories"), 0.0),
        "protein": parse_float(profile.get("recommended_protein"), 0.0),
        "carbs": parse_float(profile.get("recommended_carbs"), 0.0),
        "fat": parse_float(profile.get("recommended_fat"), 0.0),
    }
    missing = [key for key, value in targets.items() if value <= 0]
    if missing:
        raise ValueError(f"Missing or invalid target values for {profile.get('patient_id')}: {missing}")

    # Start with healthy defaults, then tighten based on conditions
    condition_targets = dict(_CONDITION_TARGETS["healthy"])
    conditions = profile.get("conditions") or []
    for cond in conditions:
        cond_str = str(cond).strip()
        ct = _CONDITION_TARGETS.get(cond_str)
        if not ct:
            continue
        # Take the stricter (lower) limit for each undesirable nutrient
        for key in ("fat", "sugar", "sodium"):
            condition_targets[key] = min(condition_targets[key], ct[key])
        # Take the higher fiber target
        condition_targets["fiber"] = max(condition_targets.get("fiber", 25.0), ct.get("fiber", 25.0))
        # Use condition-specific protein/carbs if tighter
        condition_targets["protein"] = max(condition_targets["protein"], ct["protein"])
        condition_targets["carbs"] = min(condition_targets["carbs"], ct["carbs"])

    # Merge condition limits into solver targets
    targets["sodium"] = condition_targets["sodium"]
    targets["sugar"] = condition_targets["sugar"]
    targets["fiber"] = condition_targets["fiber"]
    # Only override fat if condition tightens it below current
    if targets["fat"] > condition_targets["fat"]:
        targets["fat"] = condition_targets["fat"]

    return targets


def load_solver_inputs_from_db(
    conn: Any,
    patient_id: str,
    *,
    validate_candidates: bool = True,
) -> SolverInputBundle:
    from .core import build_candidate_pools

    profile = _load_solver_profile(conn, patient_id)
    if not profile:
        raise ValueError(f"Patient profile not found for {patient_id}")

    ingredient_cache = load_ingredient_cache(conn)
    recipe_rows = conn.execute("SELECT * FROM recipes").fetchall()
    all_dishes = [_recipe_to_filterable_dish_row(row) for row in recipe_rows]
    prefilter_counts = {
        meal: sum(1 for dish in all_dishes if meal in _parse_str_list(dish.get("meal_types")))
        for meal in MEALS
    }

    filter_profile = {
        "conditions": profile["conditions"],
        "diet": profile["diet"],
        "allergies": profile["allergies"],
    }

    # Load user favourites
    favourite_rows = conn.execute(
        "SELECT dish_id FROM favourites WHERE user_id = ?", (patient_id,)
    ).fetchall()
    favourite_ids = {str(row["dish_id"]) for row in favourite_rows}

    allowed_recipe_ids: set[str] = set()
    postfilter_counts: dict[str, int] = {}
    for meal in MEALS:
        filtered = filter_dishes(
            all_dishes,
            filter_profile,
            meal,
            ingredient_cache,
            filter_meal_type=True,
            filter_diet=True,
            filter_allergies=True,
            filter_conditions=True,
        )
        postfilter_counts[meal] = len(filtered)
        allowed_recipe_ids.update(str(dish["id"]) for dish in filtered)

    # Mark favourites on each dish before normalizing
    for dish in all_dishes:
        dish["is_favourite"] = str(dish["id"]) in favourite_ids

    filtered_recipes = tuple(
        normalize_recipe(dish)
        for dish in all_dishes
        if str(dish["id"]) in allowed_recipe_ids and not is_condiment_like_record(dish)
    )
    candidates: dict[str, tuple[SolverRecipe, ...]] = {meal: tuple() for meal in MEALS}
    if validate_candidates:
        candidates_raw = build_candidate_pools(list(filtered_recipes))
        candidates = {meal: tuple(recipes) for meal, recipes in candidates_raw.items()}

    return SolverInputBundle(
        patient_id=patient_id,
        profile=profile,
        targets=_solver_targets_from_profile(profile),
        recipes=filtered_recipes,
        candidates=candidates,
        diagnostics=SolverInputDiagnostics(
            total_recipes=len(all_dishes),
            prefilter_counts=prefilter_counts,
            postfilter_counts=postfilter_counts,
            allowed_recipe_ids=tuple(sorted(allowed_recipe_ids)),
        ),
    )
