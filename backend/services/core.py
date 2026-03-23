"""Backward-compatible re-exports — all solver logic lives in services/solver/."""
from __future__ import annotations

# Re-export everything that callers previously imported from this module.
from .solver import (  # noqa: F401
    DEFAULT_MEAL_CALORIE_RATIO,
    FixedMealAssignment,
    MealGenerationResult,
    PlanResult,
    PlannedRecipe,
    SolverConfig,
    SolverInputBundle,
    SolverRecipe,
    build_candidate_pools,
    generate_meal_plan_for_week,
    load_solver_inputs_from_db,
    normalize_recipe,
    plan_result_to_entries,
    solve_meal_plan,
    summarize_plan,
)
