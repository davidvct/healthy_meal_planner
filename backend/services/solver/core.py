from __future__ import annotations

from typing import Any

from ...utils import parse_float
from .inputs import load_solver_inputs_from_db
from .models import (
    FixedMealAssignment,
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
    except Exception as exc:
        raise RuntimeError(
            "OR-Tools is not installed. Install: pip install ortools"
        ) from exc
    return cp_model


def build_candidate_pools(recipes: list[SolverRecipe]) -> dict[str, list[SolverRecipe]]:
    breakfast = [r for r in recipes if "breakfast" in r.meal_types]
    lunch_dinner = [r for r in recipes if "lunch" in r.meal_types or "dinner" in r.meal_types]

    if not breakfast:
        breakfast = lunch_dinner[:20]
    if not lunch_dinner:
        raise ValueError("No lunch/dinner candidates available for the solver.")

    return {
        "breakfast": breakfast,
        "lunch": lunch_dinner,
        "dinner": lunch_dinner,
    }


def _create_decision_variables(model: Any, candidates: dict[str, list[SolverRecipe]], num_days: int):
    x: dict[tuple[int, str, str], Any] = {}
    servings: dict[tuple[int, str, str], Any] = {}
    for day in range(num_days):
        for meal in MEALS:
            for recipe in candidates[meal]:
                key = (day, meal, recipe.recipe_id)
                suffix = f"d{day}_{meal}_{recipe.recipe_id}"
                x[key] = model.NewBoolVar(f"x_{suffix}")
                servings[key] = model.NewIntVar(0, MAX_SERVINGS_PER_RECIPE, f"s_{suffix}")
    return x, servings


def _normalize_fixed_assignments(
    fixed_assignments: list[FixedMealAssignment] | None,
    candidates: dict[str, list[SolverRecipe]],
    num_days: int,
) -> dict[tuple[int, str], list[FixedMealAssignment]]:
    normalized: dict[tuple[int, str], list[FixedMealAssignment]] = {}
    if not fixed_assignments:
        return normalized

    candidate_ids = {meal: {r.recipe_id for r in recipes} for meal, recipes in candidates.items()}

    for a in fixed_assignments:
        day_index = int(a.day_index)
        meal_type = str(a.meal_type)
        recipe_id = str(a.recipe_id).removeprefix("r")
        key = (day_index, meal_type)

        if day_index < 0 or day_index >= num_days:
            continue
        if meal_type not in MEALS:
            continue
        if recipe_id not in candidate_ids.get(meal_type, set()):
            continue

        serving_count = max(1, min(MAX_SERVINGS_PER_RECIPE, int(round(float(a.servings)))))
        slot_list = normalized.setdefault(key, [])
        if not any(e.recipe_id == recipe_id for e in slot_list):
            slot_list.append(FixedMealAssignment(
                day_index=day_index, meal_type=meal_type,
                recipe_id=recipe_id, servings=float(serving_count),
            ))

    return normalized


def _apply_constraints(
    model: Any,
    candidates: dict[str, list[SolverRecipe]],
    x: dict, servings: dict,
    config: SolverConfig,
    fixed: dict[tuple[int, str], list[FixedMealAssignment]],
):
    for day in range(config.num_days):
        for meal in MEALS:
            meal_recipes = candidates[meal]
            assignments = fixed.get((day, meal))

            if assignments:
                fixed_ids = {a.recipe_id for a in assignments}
                fixed_servings = {a.recipe_id: int(round(a.servings)) for a in assignments}
                for recipe in meal_recipes:
                    key = (day, meal, recipe.recipe_id)
                    if recipe.recipe_id in fixed_ids:
                        model.Add(x[key] == 1)
                        model.Add(servings[key] == fixed_servings[recipe.recipe_id])
                    else:
                        model.Add(x[key] == 0)
                        model.Add(servings[key] == 0)
                model.Add(sum(x[(day, meal, r.recipe_id)] for r in meal_recipes) == len(assignments))
            else:
                for recipe in meal_recipes:
                    key = (day, meal, recipe.recipe_id)
                    model.Add(servings[key] <= MAX_SERVINGS_PER_RECIPE * x[key])
                    model.Add(servings[key] >= MIN_SERVINGS_PER_SELECTED * x[key])
                meal_max = config.get_max_recipes(meal)
                model.Add(sum(x[(day, meal, r.recipe_id)] for r in meal_recipes) <= meal_max)
                model.Add(sum(x[(day, meal, r.recipe_id)] for r in meal_recipes) >= 1)

                main_ids = [r.recipe_id for r in meal_recipes if r.is_main_course]
                if meal in ("lunch", "dinner") and main_ids:
                    # At least 1 main course required for lunch/dinner
                    model.Add(sum(x[(day, meal, rid)] for rid in main_ids) >= 1)
                    # When multiple dishes per meal, cap main courses at 1 so
                    # remaining slots go to sides/soup/salad/appetizer/dessert
                    if meal_max >= 2:
                        model.Add(sum(x[(day, meal, rid)] for rid in main_ids) <= 1)


def _build_objective(
    model: Any,
    candidates: dict[str, list[SolverRecipe]],
    x: dict, servings: dict,
    targets: dict[str, float],
    config: SolverConfig,
    fixed: dict[tuple[int, str], list[FixedMealAssignment]],
) -> Any:
    terms: list[Any] = []

    # --- Nutrient deviation penalty (hit-target nutrients) ---
    target_nutrient_getters = {
        "calories": lambda r: r.calories,
        "protein": lambda r: r.protein,
        "carbs": lambda r: r.carbs,
    }
    for nutrient, getter in target_nutrient_getters.items():
        daily_target = to_int(targets[nutrient])
        if daily_target <= 0:
            continue
        for day in range(config.num_days):
            day_total = model.NewIntVar(0, 10**9, f"day{day}_{nutrient}")
            model.Add(day_total == sum(
                to_int(getter(r)) * servings[(day, meal, r.recipe_id)]
                for meal in MEALS for r in candidates[meal]
            ))
            pos = model.NewIntVar(0, 10**9, f"dp_{nutrient}_d{day}")
            neg = model.NewIntVar(0, 10**9, f"dn_{nutrient}_d{day}")
            model.Add(day_total - daily_target == pos - neg)
            weight = max(1, int(round(1000 / daily_target)))
            terms.append(weight * (pos + neg) * 500)

    # --- Undesirable nutrients: hard cap + minimization penalty ---
    # Randomly relax 1 of 3 undesirable nutrients each solve to increase meal
    # variety across regenerations. The relaxed nutrient still cannot exceed
    # the daily limit (hard cap stays), but it won't be actively minimised,
    # giving the solver more room to pick diverse dishes.
    import random
    undesirable = ["fat", "sodium", "sugar"]
    relaxed_nutrient = random.choice(undesirable)

    limit_nutrient_getters = {
        "fat":    lambda r: r.fat,
        "sodium": lambda r: r.sodium,
        "sugar":  lambda r: r.sugar,
    }
    for nutrient, getter in limit_nutrient_getters.items():
        daily_limit = to_int(targets.get(nutrient, 0))
        if daily_limit <= 0:
            continue
        is_relaxed = nutrient == relaxed_nutrient
        for day in range(config.num_days):
            day_total = model.NewIntVar(0, 10**9, f"day{day}_{nutrient}")
            model.Add(day_total == sum(
                to_int(getter(r)) * servings[(day, meal, r.recipe_id)]
                for meal in MEALS for r in candidates[meal]
            ))
            # Hard cap: never exceed the daily limit regardless
            over = model.NewIntVar(0, 10**9, f"over_{nutrient}_d{day}")
            model.Add(day_total - daily_limit <= over)
            terms.append(over * 20000)
            if not is_relaxed:
                # Actively minimise the 2 strict nutrients
                terms.append(day_total * 15)

    # --- Desirable nutrient: maximize fiber ---
    fiber_target = to_int(targets.get("fiber", 25.0))
    if fiber_target > 0:
        for day in range(config.num_days):
            day_fiber = model.NewIntVar(0, 10**9, f"day{day}_fiber")
            model.Add(day_fiber == sum(
                to_int(r.fiber) * servings[(day, meal, r.recipe_id)]
                for meal in MEALS for r in candidates[meal]
            ))
            # Reward hitting fiber target
            shortfall = model.NewIntVar(0, 10**9, f"fiber_short_d{day}")
            model.Add(fiber_target - day_fiber <= shortfall)
            terms.append(shortfall * 200)

    # --- Meal calorie ratio deviation ---
    for day in range(config.num_days):
        if any(fixed.get((day, meal)) for meal in MEALS):
            continue
        meal_cal = {}
        for meal in MEALS:
            mc = model.NewIntVar(0, 10**9, f"mc_d{day}_{meal}")
            model.Add(mc == sum(
                to_int(r.calories) * servings[(day, meal, r.recipe_id)]
                for r in candidates[meal]
            ))
            meal_cal[meal] = mc
        for meal in MEALS:
            target = to_int(targets["calories"] * config.meal_calorie_ratio[meal])
            pos = model.NewIntVar(0, 10**9, f"mr_p_d{day}_{meal}")
            neg = model.NewIntVar(0, 10**9, f"mr_n_d{day}_{meal}")
            model.Add(meal_cal[meal] - target == pos - neg)
            terms.append((pos + neg) * 10)
        model.Add(meal_cal["breakfast"] <= meal_cal["dinner"])
        model.Add(meal_cal["dinner"] <= meal_cal["lunch"])

    # --- No-repeat penalty (3-day sliding window) ---
    all_ids = list(dict.fromkeys(r.recipe_id for meal in MEALS for r in candidates[meal]))
    for rid in all_ids:
        for start in range(config.num_days):
            window = range(start, min(config.num_days, start + 3))
            use_count = sum(
                x[(d, m, rid)] for d in window for m in MEALS if (d, m, rid) in x
            )
            excess = model.NewIntVar(0, 20, f"rpt_{rid}_{start}")
            model.Add(use_count - 1 <= excess)
            terms.append(excess * 500000)

        for day in range(config.num_days):
            day_use = sum(x[(day, m, rid)] for m in MEALS if (day, m, rid) in x)
            excess = model.NewIntVar(0, 5, f"sameday_{rid}_{day}")
            model.Add(day_use - 1 <= excess)
            terms.append(excess * 1000000)

    # --- Full-horizon uniqueness: penalize total uses > 1 across all days ---
    for rid in all_ids:
        total_uses = sum(x[(d, m, rid)] for d in range(config.num_days) for m in MEALS if (d, m, rid) in x)
        excess = model.NewIntVar(0, config.num_days * 3, f"global_rpt_{rid}")
        model.Add(total_uses - 1 <= excess)
        terms.append(excess * 300000)

    # --- Preference weights (health score, favourites, small variety noise) ---
    # When preference_weights are provided by load_solver_inputs_from_db(), they
    # encode condition-category health scores × 3000 plus favourite boost −50 000
    # plus a small noise ±5 000.  This replaces the old pure-random ±500 000
    # perturbation while keeping a weaker randomness signal for variety.
    # Falls back to pure-random + favourite_boost when weights are absent (e.g.
    # when SolverConfig is built manually without calling load_solver_inputs_from_db).
    seen_weighted: set[str] = set()
    for day in range(config.num_days):
        for meal in MEALS:
            for r in candidates[meal]:
                if r.recipe_id not in seen_weighted:
                    seen_weighted.add(r.recipe_id)
                    if config.preference_weights:
                        weight = config.preference_weights.get(r.recipe_id, 0)
                    else:
                        # Backward-compat: pure random + favourite boost
                        weight = random.randint(-500000, 500000)
                        if r.is_favourite:
                            weight -= config.favourite_boost
                    terms.append(weight * x[(day, meal, r.recipe_id)])

    # --- Condition penalties for caution / moderation dishes ---
    # These are soft costs; the solver may still pick penalised dishes when no
    # unpenalised candidate satisfies the hard nutrient constraints.
    if config.condition_penalties:
        seen_penalized: set[str] = set()
        for day in range(config.num_days):
            for meal in MEALS:
                for r in candidates[meal]:
                    if r.recipe_id not in seen_penalized and r.recipe_id in config.condition_penalties:
                        seen_penalized.add(r.recipe_id)
                        terms.append(config.condition_penalties[r.recipe_id] * x[(day, meal, r.recipe_id)])

    # --- Cross-week recency penalty: discourage dishes used in recent weeks ---
    if config.recency_penalties:
        seen_recency: set[str] = set()
        for day in range(config.num_days):
            for meal in MEALS:
                for r in candidates[meal]:
                    if r.recipe_id not in seen_recency and r.recipe_id in config.recency_penalties:
                        seen_recency.add(r.recipe_id)
                        terms.append(config.recency_penalties[r.recipe_id] * x[(day, meal, r.recipe_id)])

    # --- Sub-category variety bonus (multi-dish meals) ---
    # When max_recipes_per_meal >= 2, reward picking dishes from different
    # sub-categories within the same slot to encourage balanced meals
    # (e.g. main + soup, main + salad, main + side, main + dessert).
    if any(config.get_max_recipes(m) >= 2 for m in ("lunch", "dinner")):
        _SUB_CATS = {
            "side": lambda r: r.is_side_dish,
            "soup": lambda r: r.is_soup,
            "salad": lambda r: r.is_salad,
            "appetizer": lambda r: r.is_appetizer,
            "dessert": lambda r: r.is_dessert,
            "snack": lambda r: r.is_snack,
            "beverage": lambda r: r.is_beverage,
        }
        for day in range(config.num_days):
            for meal in ("lunch", "dinner"):
                cats_present: list[Any] = []
                for cat_name, cat_fn in _SUB_CATS.items():
                    cat_ids = [r.recipe_id for r in candidates[meal] if cat_fn(r)]
                    if cat_ids:
                        has_cat = model.NewBoolVar(f"has_{cat_name}_d{day}_{meal}")
                        model.Add(sum(x[(day, meal, rid)] for rid in cat_ids) >= 1).OnlyEnforceIf(has_cat)
                        model.Add(sum(x[(day, meal, rid)] for rid in cat_ids) == 0).OnlyEnforceIf(has_cat.Not())
                        cats_present.append(has_cat)
                # Reward variety: more distinct sub-categories = better
                if cats_present:
                    terms.append(-sum(cats_present) * 25000)

    # --- Satiety (protein + fiber) maximization ---
    satiety_terms: list[Any] = []
    for day in range(config.num_days):
        for meal in MEALS:
            for r in candidates[meal]:
                satiety_terms.append(
                    to_int(r.protein + r.fiber) * servings[(day, meal, r.recipe_id)]
                )
    terms.append(-sum(satiety_terms))

    return sum(terms)


def solve_meal_plan(
    *,
    patient_id: str,
    targets: dict[str, float],
    recipes: list[SolverRecipe],
    config: SolverConfig | None = None,
    fixed_assignments: list[FixedMealAssignment] | None = None,
) -> list[PlanResult]:
    import random

    config = config or SolverConfig()
    cp_model_mod = _import_cp_model()

    required = ("calories", "protein", "carbs", "fat")
    missing = [k for k in required if parse_float(targets.get(k), 0.0) <= 0]
    if missing:
        raise ValueError(f"Missing or invalid solver targets: {missing}")

    # Shuffle recipes to introduce randomness in variable ordering
    recipes = list(recipes)
    random.shuffle(recipes)

    candidates = build_candidate_pools(recipes)
    fixed = _normalize_fixed_assignments(fixed_assignments, candidates, config.num_days)

    model = cp_model_mod.CpModel()
    x, servings = _create_decision_variables(model, candidates, config.num_days)
    _apply_constraints(model, candidates, x, servings, config, fixed)
    objective = _build_objective(model, candidates, x, servings, targets, config, fixed)
    model.Minimize(objective)

    solver = cp_model_mod.CpSolver()
    solver.parameters.max_time_in_seconds = config.time_limit_seconds
    solver.parameters.num_search_workers = 4
    solver.parameters.random_seed = random.randint(0, 2**31 - 1)

    status = solver.Solve(model)
    if status not in (cp_model_mod.OPTIMAL, cp_model_mod.FEASIBLE):
        raise RuntimeError("No feasible meal plan found.")

    NUT_KEYS = ("calories", "protein", "carbs", "fat", "sodium", "sugar", "fiber")
    picks: dict[int, dict[str, list[PlannedRecipe]]] = {
        day: {meal: [] for meal in MEALS} for day in range(config.num_days)
    }
    totals_out: dict[str, float] = {k: 0 for k in NUT_KEYS}
    daily_totals: dict[int, dict[str, float]] = {}
    daily_satiety_by_meal: dict[int, dict[str, float]] = {}
    daily_satiety_total: dict[int, float] = {}

    for day in range(config.num_days):
        day_nut: dict[str, float] = {k: 0 for k in NUT_KEYS}
        day_sat: dict[str, float] = {}
        for meal in MEALS:
            meal_sat = 0.0
            for recipe in candidates[meal]:
                key = (day, meal, recipe.recipe_id)
                if int(solver.Value(x[key])) == 0:
                    continue
                sv = float(int(solver.Value(servings[key])))
                nut = {
                    "calories": round(recipe.calories * sv, 1),
                    "protein": round(recipe.protein * sv, 1),
                    "carbs": round(recipe.carbs * sv, 1),
                    "fat": round(recipe.fat * sv, 1),
                    "sodium": round(recipe.sodium * sv, 1),
                    "sugar": round(recipe.sugar * sv, 1),
                    "fiber": round(recipe.fiber * sv, 1),
                }
                picks[day][meal].append(PlannedRecipe(
                    recipe_id=recipe.recipe_id,
                    name=recipe.name,
                    servings=sv,
                    url=recipe.url,
                    nutrients=nut,
                ))
                for k in day_nut:
                    day_nut[k] += nut[k]
                meal_sat += (recipe.protein + recipe.fiber) * sv
            day_sat[meal] = round(meal_sat, 1)
        daily_totals[day] = {k: round(v, 1) for k, v in day_nut.items()}
        daily_satiety_by_meal[day] = day_sat
        daily_satiety_total[day] = round(sum(day_sat.values()), 1)
        for k in totals_out:
            totals_out[k] += day_nut[k]

    totals_out = {k: round(v, 1) for k, v in totals_out.items()}

    return [PlanResult(
        patient_id=patient_id,
        num_days=config.num_days,
        objective_value=solver.ObjectiveValue(),
        calorie_buffer_pct=config.calorie_buffer_pct,
        recommended={k: float(targets[k]) for k in required},
        meal_calorie_ratio=dict(config.meal_calorie_ratio),
        meal_satiety_ratio=dict(config.meal_satiety_ratio),
        daily_totals=daily_totals,
        daily_satiety_by_meal=daily_satiety_by_meal,
        daily_satiety_total=daily_satiety_total,
        totals=totals_out,
        picks=picks,
    )]


def plan_result_to_entries(
    result: PlanResult,
    *,
    week_start: str | None = None,
) -> tuple[GeneratedMealPlanEntry, ...]:
    entries: list[GeneratedMealPlanEntry] = []
    for day_index in range(result.num_days):
        for meal_type in MEALS:
            for entry_order, row in enumerate(result.picks[day_index][meal_type]):
                entries.append(GeneratedMealPlanEntry(
                    patient_id=result.patient_id,
                    week_start=week_start,
                    day_index=day_index,
                    meal_type=meal_type,
                    recipe_id=row.recipe_id,
                    servings=row.servings,
                    entry_order=entry_order,
                ))
    return tuple(entries)


def _compute_recency_penalties(
    conn: Any,
    patient_id: str,
    current_week_start: str | None,
    lookback_weeks: int = 3,
) -> dict[str, int]:
    """Query dishes used in recent weeks and return recency penalties.

    More recent usage → higher penalty.  Week-1 = 150k, Week-2 = 100k, Week-3 = 50k.
    """
    if not current_week_start:
        return {}
    from datetime import date, timedelta

    try:
        ws_date = date.fromisoformat(current_week_start)
    except (ValueError, TypeError):
        return {}

    penalties: dict[str, int] = {}
    for weeks_ago in range(1, lookback_weeks + 1):
        past_ws = (ws_date - timedelta(weeks=weeks_ago)).isoformat()
        rows = conn.execute(
            "SELECT DISTINCT dish_id FROM meal_plans WHERE user_id = ? AND week_start = ?",
            (patient_id, past_ws),
        ).fetchall()
        # Closer weeks get a heavier penalty
        weight = int(150000 / weeks_ago)
        for row in rows:
            rid = str(row["dish_id"]).removeprefix("r")
            penalties[rid] = penalties.get(rid, 0) + weight
    return penalties


def generate_meal_plan_for_week(
    conn: Any,
    *,
    patient_id: str,
    week_start: str | None = None,
    config: SolverConfig | None = None,
    fixed_assignments: list[FixedMealAssignment] | tuple[FixedMealAssignment, ...] | None = None,
    exclude_recipe_ids: set[str] | None = None,
    targets_override: dict[str, float] | None = None,
) -> MealGenerationResult:
    inputs = load_solver_inputs_from_db(conn, patient_id)
    solver_targets = dict(targets_override or inputs.targets)

    # Compute cross-week recency penalties
    recency_penalties = _compute_recency_penalties(conn, patient_id, week_start)

    # Merge preference weights from the profile-derived config with any
    # caller-supplied config overrides.  Caller config takes precedence for
    # structural settings (num_days, time_limit, etc.) while the profile-derived
    # weights always provide the health-aware preference signal.
    if config is not None and inputs.config is not None:
        from dataclasses import replace
        effective_config = replace(
            config,
            preference_weights=inputs.config.preference_weights,
            condition_penalties=inputs.config.condition_penalties,
            recency_penalties=recency_penalties,
        )
    else:
        effective_config = config or inputs.config
        if effective_config and recency_penalties:
            from dataclasses import replace
            effective_config = replace(effective_config, recency_penalties=recency_penalties)

    # Filter out recipes already used on other days (single-day mode)
    recipes = list(inputs.recipes)
    if exclude_recipe_ids:
        # Keep fixed assignment recipes even if they're in the exclude set
        fixed_ids = {a.recipe_id for a in (fixed_assignments or [])}
        recipes = [r for r in recipes if r.recipe_id not in exclude_recipe_ids or r.recipe_id in fixed_ids]

    plans = tuple(solve_meal_plan(
        patient_id=inputs.patient_id,
        targets=solver_targets,
        recipes=recipes,
        config=effective_config,
        fixed_assignments=fixed_assignments,
    ))
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


def summarize_plan(result: PlanResult) -> str:
    lines = [f"patient_id={result.patient_id}", f"days={result.num_days}"]
    for day in range(result.num_days):
        lines.append(f"day_{day + 1}")
        for meal in MEALS:
            rows = result.picks[day][meal]
            if not rows:
                lines.append(f"  {meal}: <none>")
                continue
            for row in rows:
                lines.append(f"  {meal}: {row.name} ({row.nutrients['calories']:.0f} kcal)")
    return "\n".join(lines)
