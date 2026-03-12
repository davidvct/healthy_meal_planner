from __future__ import annotations

from typing import Any

from ortools.sat.python import cp_model

from ..utils import parse_float
from .inputs import load_solver_inputs_from_db
from .models import (
    MAX_RECIPES_PER_MEAL,
    MAX_SERVINGS_PER_RECIPE,
    MEALS,
    MIN_SERVINGS_PER_SELECTED,
    GeneratedMealPlanEntry,
    MealGenerationResult,
    PlanResult,
    PlannedRecipe,
    SolverConfig,
    SolverInputBundle,
    SolverRecipe,
    from_int,
    to_int,
)


def _import_cp_model():
    try:
        from ortools.sat.python import cp_model
    except Exception as exc:  # pragma: no cover
        raise RuntimeError(
            "OR-Tools is not installed. Install dependencies first, for example: "
            "`python3 -m pip install ortools`."
        ) from exc
    return cp_model


def build_candidate_pools(recipes: list[SolverRecipe]) -> dict[str, list[SolverRecipe]]:
    # Lunch and dinner currently share the same candidate pool; later
    # constraints and objective terms are what differentiate the meals.
    breakfast = [recipe for recipe in recipes if "breakfast" in recipe.meal_types]
    lunch_dinner = [recipe for recipe in recipes if "lunch" in recipe.meal_types or "dinner" in recipe.meal_types]

    if not breakfast:
        raise ValueError("No breakfast candidates are available for the solver.")
    if not lunch_dinner:
        raise ValueError("No lunch/dinner candidates are available for the solver.")
    if not any(recipe.is_main_course for recipe in lunch_dinner):
        raise ValueError("No lunch/dinner candidates are marked as main courses.")

    return {
        "breakfast": breakfast,
        "lunch": lunch_dinner,
        "dinner": lunch_dinner,
    }


def _create_decision_variables(model: Any, candidates: dict[str, list[SolverRecipe]], num_days: int):
    # x selects a recipe for a meal slot; servings tracks the integer count for
    # the same slot so the objective can optimize portions as well as picks.
    x: dict[tuple[int, str, str], Any] = {}
    servings: dict[tuple[int, str, str], Any] = {}

    for day in range(num_days):
        for meal in MEALS:
            for recipe in candidates[meal]:
                key = (day, meal, recipe.recipe_id)
                suffix = f"d{day}_{meal}_{recipe.recipe_id}"
                x[key] = model.NewBoolVar(f"x_{suffix}")
                servings[key] = model.NewIntVar(0, MAX_SERVINGS_PER_RECIPE, f"servings_{suffix}")

    return x, servings


def _add_serving_and_meal_count_constraints(
    model: Any,
    candidates: dict[str, list[SolverRecipe]],
    x: dict[tuple[int, str, str], Any],
    servings: dict[tuple[int, str, str], Any],
    config: SolverConfig,
) -> None:
    # Every meal must have at least one recipe, but selection count and serving
    # bounds still vary by recipe type.
    for day in range(config.num_days):
        for meal in MEALS:
            meal_recipes = candidates[meal]
            for recipe in meal_recipes:
                key = (day, meal, recipe.recipe_id)
                min_servings = MIN_SERVINGS_PER_SELECTED
                max_servings = MAX_SERVINGS_PER_RECIPE
                if meal in ("lunch", "dinner") and recipe.is_main_course:
                    min_servings = config.main_course_min_servings
                    max_servings = config.main_course_max_servings
                model.Add(servings[key] <= max_servings * x[key])
                model.Add(servings[key] >= min_servings * x[key])

            model.Add(sum(x[(day, meal, recipe.recipe_id)] for recipe in meal_recipes) <= MAX_RECIPES_PER_MEAL)
            model.Add(sum(x[(day, meal, recipe.recipe_id)] for recipe in meal_recipes) >= 1)


def _add_side_dish_limit_constraints(
    model: Any,
    candidates: dict[str, list[SolverRecipe]],
    x: dict[tuple[int, str, str], Any],
    config: SolverConfig,
) -> None:
    for meal in ("lunch", "dinner"):
        side_recipe_ids = [recipe.recipe_id for recipe in candidates[meal] if recipe.is_side_dish]
        if not side_recipe_ids:
            continue
        for day in range(config.num_days):
            model.Add(sum(x[(day, meal, recipe_id)] for recipe_id in side_recipe_ids) <= 1)


def _add_meal_calorie_ordering_constraints(
    model: Any,
    candidates: dict[str, list[SolverRecipe]],
    servings: dict[tuple[int, str, str], Any],
    config: SolverConfig,
) -> dict[int, dict[str, Any]]:
    # This encodes the product rule that lunch should be the heaviest meal and
    # breakfast the lightest.
    meal_calories_vars: dict[int, dict[str, Any]] = {day: {} for day in range(config.num_days)}

    for day in range(config.num_days):
        day_vars: dict[str, Any] = {}
        for meal in MEALS:
            total = model.NewIntVar(0, 10**9, f"meal_calories_d{day}_{meal}")
            model.Add(
                total
                == sum(
                    to_int(recipe.calories) * servings[(day, meal, recipe.recipe_id)]
                    for recipe in candidates[meal]
                )
            )
            day_vars[meal] = total
            meal_calories_vars[day][meal] = total

        model.Add(day_vars["breakfast"] <= day_vars["dinner"])
        model.Add(day_vars["dinner"] <= day_vars["lunch"])

    return meal_calories_vars


def _add_no_repeat_constraints(
    model: Any,
    x: dict[tuple[int, str, str], Any],
    candidates: dict[str, list[SolverRecipe]],
    config: SolverConfig,
) -> None:
    # Sliding windows prevent the same recipe from dominating adjacent days.
    breakfast_ids = [recipe.recipe_id for recipe in candidates["breakfast"]]
    lunch_dinner_ids = list(dict.fromkeys(recipe.recipe_id for recipe in candidates["lunch"]))

    for recipe_id in breakfast_ids:
        for start_day in range(config.num_days):
            window_days = range(start_day, min(config.num_days, start_day + 3))
            model.Add(sum(x[(day, "breakfast", recipe_id)] for day in window_days) <= 1)

    for recipe_id in lunch_dinner_ids:
        for start_day in range(config.num_days):
            window_days = range(start_day, min(config.num_days, start_day + 3))
            model.Add(sum(x[(day, meal, recipe_id)] for day in window_days for meal in ("lunch", "dinner")) <= 1)


def _add_nutrient_constraints(
    model: Any,
    candidates: dict[str, list[SolverRecipe]],
    servings: dict[tuple[int, str, str], Any],
    targets: dict[str, float],
    config: SolverConfig,
) -> tuple[dict[str, Any], dict[int, dict[str, Any]], list[Any]]:
    # Daily totals are hard upper bounds; multi-day totals are optimized toward
    # the target rather than forced to match exactly.
    totals: dict[str, Any] = {}
    daily_totals_vars: dict[int, dict[str, Any]] = {day: {} for day in range(config.num_days)}
    deviation_terms: list[Any] = []

    nutrient_getters = {
        "calories": lambda recipe: recipe.calories,
        "protein": lambda recipe: recipe.protein,
        "carbs": lambda recipe: recipe.carbs,
        "fat": lambda recipe: recipe.fat,
    }

    for nutrient, getter in nutrient_getters.items():
        daily_target = to_int(targets[nutrient])
        expr_terms: list[Any] = []

        for day in range(config.num_days):
            day_terms: list[Any] = []
            for meal in MEALS:
                for recipe in candidates[meal]:
                    term = to_int(getter(recipe)) * servings[(day, meal, recipe.recipe_id)]
                    expr_terms.append(term)
                    day_terms.append(term)

            day_total = model.NewIntVar(0, 10**9, f"day{day}_total_{nutrient}")
            model.Add(day_total == sum(day_terms))
            model.Add(day_total <= daily_target)
            daily_totals_vars[day][nutrient] = day_total

        total = model.NewIntVar(0, 10**9, f"total_{nutrient}")
        model.Add(total == sum(expr_terms))
        totals[nutrient] = total

        if nutrient == "calories":
            target = int(round(daily_target * config.num_days * (1.0 - config.calorie_buffer_pct)))
        else:
            target = daily_target * config.num_days
        pos = model.NewIntVar(0, 10**9, f"dev_pos_{nutrient}")
        neg = model.NewIntVar(0, 10**9, f"dev_neg_{nutrient}")
        model.Add(total - target == pos - neg)
        weight = 1 if target <= 0 else max(1, int(round(1000 / target)))
        deviation_terms.append(weight * (pos + neg))

    return totals, daily_totals_vars, deviation_terms


def _add_variety_constraints(
    model: Any,
    candidates: dict[str, list[SolverRecipe]],
    x: dict[tuple[int, str, str], Any],
    config: SolverConfig,
):
    # Penalize reusing the same recipe key across the planning horizon.
    used: dict[tuple[str, str], Any] = {}
    for meal in MEALS:
        for recipe in candidates[meal]:
            used[(meal, recipe.recipe_id)] = model.NewBoolVar(f"used_{meal}_{recipe.recipe_id}")
            day_uses = [x[(day, meal, recipe.recipe_id)] for day in range(config.num_days)]
            for day_use in day_uses:
                model.Add(day_use <= used[(meal, recipe.recipe_id)])
            model.Add(sum(day_uses) >= used[(meal, recipe.recipe_id)])

    total_selected = sum(x.values())
    unique_selected = sum(used.values())
    return total_selected - unique_selected


def _add_satiety_constraints(
    model: Any,
    candidates: dict[str, list[SolverRecipe]],
    servings: dict[tuple[int, str, str], Any],
    config: SolverConfig,
) -> tuple[dict[int, dict[str, Any]], dict[int, Any], list[Any], list[Any]]:
    # Satiety is modeled as protein + fiber, then balanced across meals by ratio.
    daily_satiety_by_meal_vars: dict[int, dict[str, Any]] = {day: {} for day in range(config.num_days)}
    daily_satiety_total_vars: dict[int, Any] = {}
    satiety_ratio_deviation_terms: list[Any] = []
    total_satiety_all_days_terms: list[Any] = []
    satiety_ratio_percent = {meal: int(round(config.meal_satiety_ratio[meal] * 100)) for meal in MEALS}

    for day in range(config.num_days):
        meal_satiety: dict[str, Any] = {}
        for meal in MEALS:
            total = model.NewIntVar(0, 10**9, f"meal_satiety_d{day}_{meal}")
            model.Add(
                total
                == sum(
                    to_int(recipe.protein + recipe.fiber) * servings[(day, meal, recipe.recipe_id)]
                    for recipe in candidates[meal]
                )
            )
            meal_satiety[meal] = total
            daily_satiety_by_meal_vars[day][meal] = total

        day_total = model.NewIntVar(0, 10**9, f"day_satiety_total_d{day}")
        model.Add(day_total == sum(meal_satiety.values()))
        daily_satiety_total_vars[day] = day_total
        total_satiety_all_days_terms.append(day_total)

        for meal in MEALS:
            pos = model.NewIntVar(0, 10**9, f"satiety_ratio_dev_pos_d{day}_{meal}")
            neg = model.NewIntVar(0, 10**9, f"satiety_ratio_dev_neg_d{day}_{meal}")
            model.Add(100 * meal_satiety[meal] - int(round(config.meal_satiety_ratio[meal] * 100)) * day_total == pos - neg)
            satiety_ratio_deviation_terms.append(pos + neg)

    return daily_satiety_by_meal_vars, daily_satiety_total_vars, satiety_ratio_deviation_terms, total_satiety_all_days_terms


def _add_calorie_ratio_constraints(
    model: Any,
    meal_calories_vars: dict[int, dict[str, Any]],
    targets: dict[str, float],
    config: SolverConfig,
) -> list[Any]:
    # Soft meal-ratio targets make the model prefer a realistic calorie split
    # without sacrificing feasibility.
    meal_ratio_deviation_terms: list[Any] = []
    daily_calories_target = float(targets["calories"])

    for day in range(config.num_days):
        for meal in MEALS:
            target = to_int(daily_calories_target * config.meal_calorie_ratio[meal])
            pos = model.NewIntVar(0, 10**9, f"meal_ratio_dev_pos_d{day}_{meal}")
            neg = model.NewIntVar(0, 10**9, f"meal_ratio_dev_neg_d{day}_{meal}")
            model.Add(meal_calories_vars[day][meal] - target == pos - neg)
            meal_ratio_deviation_terms.append(pos + neg)

    return meal_ratio_deviation_terms


def solve_meal_plan(
    *,
    patient_id: str,
    targets: dict[str, float],
    recipes: list[SolverRecipe],
    config: SolverConfig | None = None,
) -> list[PlanResult]:
    config = config or SolverConfig()
    cp_model = _import_cp_model()

    required_targets = ("calories", "protein", "carbs", "fat")
    missing_targets = [key for key in required_targets if parse_float(targets.get(key), 0.0) <= 0]
    if missing_targets:
        raise ValueError(f"Missing or invalid solver targets: {missing_targets}")

    candidates = build_candidate_pools(recipes)
    model = cp_model.CpModel()
    x, servings = _create_decision_variables(model, candidates, config.num_days)

    _add_serving_and_meal_count_constraints(model, candidates, x, servings, config)
    _add_side_dish_limit_constraints(model, candidates, x, config)
    meal_calories_vars = _add_meal_calorie_ordering_constraints(model, candidates, servings, config)
    _add_no_repeat_constraints(model, x, candidates, config)
    totals, daily_totals_vars, deviation_terms = _add_nutrient_constraints(
        model, candidates, servings, targets, config
    )
    repeat_penalty = _add_variety_constraints(model, candidates, x, config)
    daily_satiety_by_meal_vars, daily_satiety_total_vars, satiety_ratio_deviation_terms, total_satiety_all_days_terms = _add_satiety_constraints(
        model, candidates, servings, config
    )
    meal_ratio_deviation_terms = _add_calorie_ratio_constraints(model, meal_calories_vars, targets, config)

    # Weight nutrient miss heavily, then shape the plan with softer meal-balance,
    # satiety, variety, and total-satiety preferences.
    objective_expr = (
        sum(deviation_terms) * 1000
        + sum(meal_ratio_deviation_terms) * 10
        + sum(satiety_ratio_deviation_terms) * 2
        + repeat_penalty
        - sum(total_satiety_all_days_terms)
    )
    model.Minimize(objective_expr)

    def build_solver() -> Any:
        solver = cp_model.CpSolver()
        solver.parameters.max_time_in_seconds = config.time_limit_seconds
        solver.parameters.num_search_workers = 8
        return solver

    def extract_plan_from_getter(value_getter, objective_value: float) -> PlanResult:
        # Convert integer solver values back into the API-facing result model.
        picks: dict[int, dict[str, list[PlannedRecipe]]] = {
            day: {meal: [] for meal in MEALS} for day in range(config.num_days)
        }
        totals_out = {key: from_int(value_getter(var)) for key, var in totals.items()}
        daily_totals_out = {
            day: {key: from_int(value_getter(daily_totals_vars[day][key])) for key in totals.keys()}
            for day in range(config.num_days)
        }
        daily_satiety_by_meal_out = {
            day: {meal: from_int(value_getter(daily_satiety_by_meal_vars[day][meal])) for meal in MEALS}
            for day in range(config.num_days)
        }
        daily_satiety_total_out = {
            day: from_int(value_getter(daily_satiety_total_vars[day]))
            for day in range(config.num_days)
        }

        for day in range(config.num_days):
            for meal in MEALS:
                for recipe in candidates[meal]:
                    key = (day, meal, recipe.recipe_id)
                    if int(value_getter(x[key])) == 0:
                        continue
                    serving_count = float(int(value_getter(servings[key])))
                    picks[day][meal].append(
                        PlannedRecipe(
                            recipe_id=recipe.recipe_id,
                            name=recipe.name,
                            servings=serving_count,
                            url=recipe.url,
                            nutrients={
                                "calories": round(recipe.calories * serving_count, 1),
                                "protein": round(recipe.protein * serving_count, 1),
                                "carbs": round(recipe.carbs * serving_count, 1),
                                "fat": round(recipe.fat * serving_count, 1),
                            },
                        )
                    )

        return PlanResult(
            patient_id=patient_id,
            num_days=config.num_days,
            objective_value=objective_value,
            calorie_buffer_pct=config.calorie_buffer_pct,
            recommended={key: float(targets[key]) for key in required_targets},
            meal_calorie_ratio=dict(config.meal_calorie_ratio),
            meal_satiety_ratio=dict(config.meal_satiety_ratio),
            daily_totals=daily_totals_out,
            daily_satiety_by_meal=daily_satiety_by_meal_out,
            daily_satiety_total=daily_satiety_total_out,
            totals=totals_out,
            picks=picks,
        )

    plans: list[PlanResult] = []
    seen_signatures: set[tuple[tuple[int, str, str, int, int], ...]] = set()
    max_solutions = max(1, min(3, config.max_solutions))

    class IntermediateSolutionCollector(cp_model.CpSolverSolutionCallback):
        def OnSolutionCallback(self) -> None:  # pragma: no cover
            # Keep only distinct snapshots so max_solutions returns actual
            # alternatives instead of repeated incumbent states.
            signature = tuple(
                (day, meal, recipe.recipe_id, self.Value(x[(day, meal, recipe.recipe_id)]), self.Value(servings[(day, meal, recipe.recipe_id)]))
                for day in range(config.num_days)
                for meal in MEALS
                for recipe in candidates[meal]
            )
            if signature in seen_signatures:
                return
            seen_signatures.add(signature)
            plans.append(extract_plan_from_getter(self.Value, self.ObjectiveValue()))
            if len(plans) > max_solutions:
                plans.pop(0)

    solver = build_solver()
    collector = IntermediateSolutionCollector()
    status = solver.Solve(model, collector)

    if status in (cp_model.OPTIMAL, cp_model.FEASIBLE):
        final_signature = tuple(
            (day, meal, recipe.recipe_id, solver.Value(x[(day, meal, recipe.recipe_id)]), solver.Value(servings[(day, meal, recipe.recipe_id)]))
            for day in range(config.num_days)
            for meal in MEALS
            for recipe in candidates[meal]
        )
        if final_signature not in seen_signatures:
            plans.append(extract_plan_from_getter(solver.Value, solver.ObjectiveValue()))
        if len(plans) > max_solutions:
            plans = plans[-max_solutions:]

    if not plans:
        raise RuntimeError("No feasible meal plan found.")
    return plans


def plan_result_to_entries(
    result: PlanResult,
    *,
    week_start: str | None = None,
) -> tuple[GeneratedMealPlanEntry, ...]:
    entries: list[GeneratedMealPlanEntry] = []
    for day_index in range(result.num_days):
        # The persisted shape is 1-based even though solver internals are 0-based.
        persisted_day_index = day_index + 1
        for meal_type in MEALS:
            for entry_order, row in enumerate(result.picks[day_index][meal_type]):
                entries.append(
                    GeneratedMealPlanEntry(
                        patient_id=result.patient_id,
                        week_start=week_start,
                        day_index=persisted_day_index,
                        meal_type=meal_type,
                        recipe_id=row.recipe_id,
                        servings=row.servings,
                        entry_order=entry_order,
                    )
                )
    return tuple(entries)


def generate_meal_plan_from_inputs(
    inputs: SolverInputBundle,
    *,
    week_start: str | None = None,
    config: SolverConfig | None = None,
) -> MealGenerationResult:
    # The first plan remains the selected one; additional plans are retained as
    # alternates for inspection/debugging.
    plans = tuple(
        solve_meal_plan(
            patient_id=inputs.patient_id,
            targets=inputs.targets,
            recipes=list(inputs.recipes),
            config=config,
        )
    )
    selected_plan = plans[0]
    entries = plan_result_to_entries(selected_plan, week_start=week_start)
    return MealGenerationResult(
        patient_id=inputs.patient_id,
        week_start=week_start,
        inputs=inputs,
        plans=plans,
        selected_plan=selected_plan,
        entries=entries,
    )


def generate_meal_plan_for_week(
    conn: Any,
    *,
    patient_id: str,
    week_start: str | None = None,
    config: SolverConfig | None = None,
) -> MealGenerationResult:
    inputs = load_solver_inputs_from_db(conn, patient_id)
    return generate_meal_plan_from_inputs(inputs, week_start=week_start, config=config)


def summarize_plan(result: PlanResult) -> str:
    # CLI summaries stay deliberately plain text so they are easy to diff and paste.
    lines = [
        f"patient_id={result.patient_id}",
        f"objective={result.objective_value:.2f}",
        f"days={result.num_days}",
        "recommended_daily_targets="
        + ", ".join(f"{key}:{value:.1f}" for key, value in result.recommended.items()),
    ]

    for day in range(result.num_days):
        lines.append(f"day_{day + 1}")
        for meal in MEALS:
            rows = result.picks[day][meal]
            if not rows:
                lines.append(f"  {meal}: <none>")
                continue
            lines.append(f"  {meal}:")
            for row in rows:
                nutrient_summary = ", ".join(f"{key}={value:.1f}" for key, value in row.nutrients.items())
                lines.append(
                    f"    - {row.name} [recipe_id={row.recipe_id}, servings={row.servings:.0f}] {nutrient_summary}"
                )
        day_totals = ", ".join(f"{key}={value:.1f}" for key, value in result.daily_totals[day].items())
        lines.append(f"  totals: {day_totals}")

    lines.append("full_plan_totals=" + ", ".join(f"{key}:{value:.1f}" for key, value in result.totals.items()))
    return "\n".join(lines)


def summarize_solver_inputs(inputs: SolverInputBundle) -> str:
    diagnostics = inputs.diagnostics
    if diagnostics is None:
        return "solver_input_diagnostics=<none>"

    lines = [
        f"patient_id={inputs.patient_id}",
        f"total_recipes={diagnostics.total_recipes}",
        "prefilter_counts=" + ", ".join(
            f"{meal}:{count}" for meal, count in diagnostics.prefilter_counts.items()
        ),
        "postfilter_counts=" + ", ".join(
            f"{meal}:{count}" for meal, count in diagnostics.postfilter_counts.items()
        ),
        f"allowed_recipe_count={len(diagnostics.allowed_recipe_ids)}",
    ]
    return "\n".join(lines)
