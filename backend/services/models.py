"""Backward-compatible re-exports — all models live in services/solver/models.py."""
from __future__ import annotations

from .solver.models import (  # noqa: F401
    DEFAULT_MEAL_CALORIE_RATIO,
    DEFAULT_MEAL_SATIETY_RATIO,
    FixedMealAssignment,
    GeneratedMealPlanEntry,
    MEALS,
    MAX_RECIPES_PER_MEAL,
    MAX_SERVINGS_PER_RECIPE,
    MIN_SERVINGS_PER_SELECTED,
    MealGenerationResult,
    PlanResult,
    PlannedRecipe,
    SCALE,
    SolverConfig,
    SolverInputBundle,
    SolverInputDiagnostics,
    SolverRecipe,
    from_int,
    is_condiment_like_record,
    normalize_recipe,
    to_int,
    _parse_str_list,
)
