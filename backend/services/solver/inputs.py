from __future__ import annotations

import random
from typing import Any

from ...constants import CONDITION_CONFIG
from ...utils import parse_float
from ..dish_candidate import DishCandidate, build_dish_candidate, is_condiment_like
from ..nutrient_calculator import load_ingredient_cache
from ..profile_loader import UserProfile, load_user_profile
from ..recommendation_engine import condition_category_score, filter_dishes
from .models import (
    MEALS,
    SolverConfig,
    SolverInputBundle,
    SolverInputDiagnostics,
    SolverRecipe,
    _parse_str_list,
    normalize_recipe,
)

# ---------------------------------------------------------------------------
# Condition-aware daily nutrient targets (healthy baseline)
# ---------------------------------------------------------------------------

_HEALTHY_DAILY_TARGETS = {
    "protein": 60.0, "carbs": 275.0, "fat": 65.0,
    "sugar": 50.0, "sodium": 2000.0, "fiber": 25.0,
}


def _solver_targets_from_profile(profile: UserProfile) -> dict[str, float]:
    targets = {
        "calories": parse_float(profile.recommended_calories, 0.0),
        "protein": parse_float(profile.recommended_protein, 0.0),
        "carbs": parse_float(profile.recommended_carbs, 0.0),
        "fat": parse_float(profile.recommended_fat, 0.0),
    }
    missing = [k for k, v in targets.items() if v <= 0]
    if missing:
        raise ValueError(f"Missing or invalid target values for {profile.patient_id}: {missing}")

    # Start with healthy defaults, then tighten based on active conditions
    condition_targets = dict(_HEALTHY_DAILY_TARGETS)
    for cond in profile.conditions:
        cfg = CONDITION_CONFIG.get(cond)
        if not cfg:
            continue
        ct = cfg["daily_targets"]
        for key in ("fat", "sugar", "sodium"):
            condition_targets[key] = min(condition_targets[key], ct[key])
        condition_targets["fiber"] = max(condition_targets.get("fiber", 25.0), ct.get("fiber", 25.0))
        condition_targets["protein"] = max(condition_targets["protein"], ct["protein"])
        condition_targets["carbs"] = min(condition_targets["carbs"], ct["carbs"])

    targets["sodium"] = condition_targets["sodium"]
    targets["sugar"] = condition_targets["sugar"]
    targets["fiber"] = condition_targets["fiber"]
    if targets["fat"] > condition_targets["fat"]:
        targets["fat"] = condition_targets["fat"]

    return targets


# ---------------------------------------------------------------------------
# Preference weight computation — replaces random ±500 k perturbation
# ---------------------------------------------------------------------------

def _compute_preference_weights(
    dishes: list[DishCandidate],
    conditions: list[str],
    favourite_ids: set[str],
) -> dict[str, int]:
    """Return a per-recipe_id weight used as the solver preference term.

    Negative → preferred (solver minimises); positive → penalised.
    Components:
    - Health condition score × 3000 per condition
    - Favourite: −50 000 (same magnitude as old ``favourite_boost``)
    - Small noise ±5 000 (variety across solves while still signal-dominated)
    """
    weights: dict[str, int] = {}
    for dish in dishes:
        score = 0
        for condition in conditions:
            cfg = CONDITION_CONFIG.get(condition)
            if cfg:
                val = getattr(dish, cfg["category_column"], None)
                score += int(condition_category_score(val) * 3000)
        if dish.id in favourite_ids:
            score -= 50000
        score += random.randint(-5000, 5000)
        weights[dish.id] = score
    return weights


def _compute_condition_penalties(
    dishes: list[DishCandidate],
    conditions: list[str],
) -> dict[str, int]:
    """Return a soft penalty for caution/moderation dishes.

    Unlike the hard "avoid" filter in ``filter_dishes``, these dishes pass
    filtering but incur a cost in the solver objective so they are used only
    when no better candidate exists.
    """
    penalties: dict[str, int] = {}
    for dish in dishes:
        penalty = 0
        for condition in conditions:
            cfg = CONDITION_CONFIG.get(condition)
            if cfg:
                val = str(getattr(dish, cfg["category_column"], None) or "").lower()
                if "caution" in val:
                    penalty += 200000
                elif "moderation" in val:
                    penalty += 50000
        if penalty > 0:
            penalties[dish.id] = penalty
    return penalties


# ---------------------------------------------------------------------------
# Main entry point
# ---------------------------------------------------------------------------

def load_solver_inputs_from_db(
    conn: Any,
    patient_id: str,
    *,
    validate_candidates: bool = True,
) -> SolverInputBundle:
    from .core import build_candidate_pools

    profile = load_user_profile(conn, patient_id)
    if not profile:
        raise ValueError(f"Patient profile not found for {patient_id}")

    ingredient_cache = load_ingredient_cache(conn)
    recipe_rows = conn.execute("SELECT * FROM recipes").fetchall()

    # Load favourites upfront so we can mark them on DishCandidate immediately
    favourite_rows = conn.execute(
        "SELECT dish_id FROM favourites WHERE user_id = ?", (patient_id,)
    ).fetchall()
    favourite_ids: set[str] = {str(row["dish_id"]) for row in favourite_rows}

    all_dishes = [
        build_dish_candidate(row, is_favourite=str(row["id"]) in favourite_ids)
        for row in recipe_rows
    ]

    prefilter_counts = {
        meal: sum(1 for dish in all_dishes if meal in dish.meal_types)
        for meal in MEALS
    }

    filter_profile = {
        "conditions": profile.conditions,
        "diet": profile.diet,
        "allergies": profile.allergies,
    }

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
        allowed_recipe_ids.update(dish.id for dish in filtered)

    allowed_dishes = [
        dish for dish in all_dishes
        if dish.id in allowed_recipe_ids and not is_condiment_like(dish)
    ]

    # Compute scorer-derived preference weights — replaces pure random perturbation
    preference_weights = _compute_preference_weights(allowed_dishes, profile.conditions, favourite_ids)
    condition_penalties = _compute_condition_penalties(allowed_dishes, profile.conditions)

    filtered_recipes = tuple(normalize_recipe({
        "id": dish.id,
        "name": dish.name,
        "url": dish.url,
        "category": dish.category,
        "meal_types": list(dish.meal_types),
        "is_main_course": dish.is_main_course,
        "is_side_dish": dish.is_side_dish,
        "calories": dish.calories,
        "protein": dish.protein,
        "carbs": dish.carbs,
        "fat": dish.fat,
        "fiber": dish.fiber,
        "sodium": dish.sodium,
        "sugar": dish.sugar,
        "cholesterol": dish.cholesterol,
        "is_favourite": dish.is_favourite,
    }) for dish in allowed_dishes)

    config = SolverConfig(
        preference_weights=preference_weights,
        condition_penalties=condition_penalties,
    )

    candidates: dict[str, tuple[SolverRecipe, ...]] = {meal: tuple() for meal in MEALS}
    if validate_candidates:
        candidates_raw = build_candidate_pools(list(filtered_recipes))
        candidates = {meal: tuple(recipes) for meal, recipes in candidates_raw.items()}

    return SolverInputBundle(
        patient_id=patient_id,
        profile={
            "patient_id": profile.patient_id,
            "conditions": profile.conditions,
            "diet": profile.diet,
            "allergies": profile.allergies,
            "recommended_calories": profile.recommended_calories,
            "recommended_protein": profile.recommended_protein,
            "recommended_carbs": profile.recommended_carbs,
            "recommended_fat": profile.recommended_fat,
        },
        targets=_solver_targets_from_profile(profile),
        recipes=filtered_recipes,
        candidates=candidates,
        config=SolverConfig(
            preference_weights=preference_weights,
            condition_penalties=condition_penalties,
        ),
        diagnostics=SolverInputDiagnostics(
            total_recipes=len(all_dishes),
            prefilter_counts=prefilter_counts,
            postfilter_counts=postfilter_counts,
            allowed_recipe_ids=tuple(sorted(allowed_recipe_ids)),
        ),
    )
