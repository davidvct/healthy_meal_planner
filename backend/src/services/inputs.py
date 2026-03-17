from __future__ import annotations

from typing import Any

from ..data import load_seed_data, recommend_targets
from ..utils import parse_float, parse_ingredients_map, parse_json
from .models import (
    MEALS,
    SolverInputBundle,
    SolverInputDiagnostics,
    SolverRecipe,
    _parse_str_list,
    is_condiment_like_record,
    normalize_recipe,
)
from .nutrient_calculator import load_ingredient_cache
from .recommendation_engine import filter_dishes


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
    if row.get("is_keto"):
        return "keto"
    return "none"


def _recipe_to_filterable_dish_row(recipe: dict[str, Any]) -> dict[str, Any]:
    recipe_id = str(recipe.get("id"))
    ingredients_map = parse_ingredients_map(recipe.get("ingredients"))
    normalized = normalize_recipe(recipe)

    # The recommendation filter expects a richer dish shape than the raw recipe
    # table provides, so adapt DB rows into that contract here.
    return {
        "id": recipe_id,
        "recipe_id": recipe_id,
        "recipeId": recipe_id,
        "name": recipe.get("name") or f"Recipe {recipe_id}",
        "url": recipe.get("url") or "",
        "sourceUrl": recipe.get("url") or "",
        "category": recipe.get("category") or "",
        "meal_types": list(normalized.meal_types),
        "is_main_course": normalized.is_main_course,
        "is_side_dish": normalized.is_side_dish,
        "tags": _recipe_tags(recipe),
        "ingredients": ingredients_map,
        "allergies": _parse_csv_words(recipe.get("allergies")),
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
        "description": recipe.get("description") or "",
    }


def _normalize_profile_list(value: Any) -> list[str]:
    parsed = parse_json(value, None)
    if isinstance(parsed, list):
        return [str(item).strip() for item in parsed if str(item).strip()]
    if isinstance(value, str):
        text = value.strip()
        if not text:
            return []
        return [item.strip() for item in text.split(",") if item.strip()]
    return []


def _load_solver_profile(conn: Any, patient_id: str) -> dict[str, Any] | None:
    uid = str(patient_id or "")
    lookup_ids = [uid]
    if uid.startswith("fm:"):
        lookup_ids.insert(0, uid[3:])

    # Family members may be referenced with an fm: prefix, but the users table
    # still needs the bare id lookup first when available.
    for lookup_id in lookup_ids:
        user = conn.execute("SELECT * FROM users WHERE id = ?", (lookup_id,)).fetchone()
        if not user:
            continue

        age = int(parse_float(user.get("age"), 0.0)) if user.get("age") is not None else None
        weight_kg = parse_float(user.get("weight_kg"), 0.0) if user.get("weight_kg") is not None else None
        diet = str(user.get("diet") or user.get("dietary_habits") or "none").strip().lower() or "none"
        fallback_targets = recommend_targets(age, user.get("sex"), weight_kg, diet)
        return {
            "patient_id": uid,
            "source": "user",
            "age": age,
            "sex": user.get("sex"),
            "weight_kg": weight_kg,
            "conditions": _normalize_profile_list(user.get("conditions")),
            "diet": diet,
            "allergies": _normalize_profile_list(user.get("allergies")),
            "recommended_calories": parse_float(user.get("recommended_calories"), fallback_targets["calories"]),
            "recommended_protein": parse_float(user.get("recommended_protein"), fallback_targets["protein"]),
            "recommended_carbs": parse_float(user.get("recommended_carbs"), fallback_targets["carbs"]),
            "recommended_fat": parse_float(user.get("recommended_fat"), fallback_targets["fat"]),
        }

    if uid.startswith("fm:"):
        member_id = uid[3:]
        member = conn.execute("SELECT * FROM family_members WHERE id::text = ?", (member_id,)).fetchone()
        if not member:
            return None

        age = int(parse_float(member.get("age"), 0.0)) if member.get("age") is not None else None
        weight_kg = parse_float(member.get("weight_kg"), 0.0) if member.get("weight_kg") is not None else None
        diet = str(member.get("dietary_prefs") or "none").strip().lower() or "none"
        derived_targets = recommend_targets(age, member.get("sex"), weight_kg, diet)
        return {
            "patient_id": uid,
            "source": "family_member",
            "age": age,
            "sex": member.get("sex"),
            "weight_kg": weight_kg,
            "conditions": _normalize_profile_list(member.get("conditions")),
            "diet": diet,
            "allergies": _normalize_profile_list(member.get("allergies")),
            "recommended_calories": derived_targets["calories"],
            "recommended_protein": derived_targets["protein"],
            "recommended_carbs": derived_targets["carbs"],
            "recommended_fat": derived_targets["fat"],
        }

    return None


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

    # Candidates are unioned across meals first, then re-bucketed by the solver
    # so diagnostics can report both prefilter and postfilter counts.
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


def build_seed_demo_inputs(
    *,
    age: int | None,
    sex: str | None,
    weight_kg: float | None,
    diet: str,
) -> tuple[dict[str, float], list[SolverRecipe]]:
    # Seed mode bypasses DB filtering and feeds the solver a deterministic local
    # fixture set for quick constraint iteration.
    seed_data = load_seed_data()
    targets = recommend_targets(age, sex, weight_kg, diet)
    recipes = [normalize_recipe(record) for record in seed_data["dishes"] if not is_condiment_like_record(record)]
    return targets, recipes
