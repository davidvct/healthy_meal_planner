from __future__ import annotations

from dataclasses import dataclass, field
from typing import Any

from ..utils import parse_float, parse_json

# Constants
MEALS = ("breakfast", "lunch", "dinner")
SATIETY_NUTRIENTS = ("protein", "fiber")
SCALE = 10
MIN_SERVINGS_PER_SELECTED = 2
MAX_SERVINGS_PER_RECIPE = 2
MAX_RECIPES_PER_MEAL = 1
DEFAULT_MEAL_CALORIE_RATIO = {"breakfast": 0.20, "lunch": 0.45, "dinner": 0.35}
DEFAULT_MEAL_SATIETY_RATIO = {"breakfast": 0.15, "lunch": 0.50, "dinner": 0.35}
DEFAULT_MAIN_COURSE_MIN_SERVINGS = 1
DEFAULT_MAIN_COURSE_MAX_SERVINGS = 1
DEFAULT_CALORIE_BUFFER_PCT = 0.1
DEFAULT_SOLVER_TIME_LIMIT_SECONDS = 5


def to_int(value: float) -> int:
    # OR-Tools expects integer coefficients, so nutrients are scaled up.
    return int(round(float(value) * SCALE))


def from_int(value: int) -> float:
    return value / SCALE


def _derive_meal_types(category: str) -> tuple[str, ...]:
    # Seed and DB recipes use inconsistent category labels, so infer meal slots
    # from broad keywords instead of relying on exact taxonomy values.
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
    if any(token in text for token in ("snack", "dessert", "drink", "beverage", "appetizer")):
        meal_types.append("snack")
    if not meal_types:
        meal_types = ["lunch", "dinner"]

    return tuple(dict.fromkeys(meal_types))


def _clean_tags(value: Any) -> tuple[str, ...]:
    parsed = parse_json(value, None)
    if isinstance(parsed, list):
        raw = [str(x).strip().lower().replace(" ", "_") for x in parsed if str(x).strip()]
        return tuple(dict.fromkeys(raw))
    if isinstance(value, str):
        raw = [x.strip().lower().replace(" ", "_") for x in value.split(",") if x.strip()]
    else:
        raw = [str(x).strip().lower().replace(" ", "_") for x in (value or []) if str(x).strip()]
    return tuple(dict.fromkeys(raw))


def _contains_any(text: str, tokens: tuple[str, ...]) -> bool:
    return any(token in text for token in tokens)


def _parse_str_list(value: Any) -> tuple[str, ...]:
    parsed = parse_json(value, None)
    if isinstance(parsed, list):
        return tuple(
            dict.fromkeys(str(item).strip().lower() for item in parsed if str(item).strip())
        )
    if isinstance(value, str):
        raw = [item.strip().lower() for item in value.split(",") if item.strip()]
        return tuple(dict.fromkeys(raw))
    if isinstance(value, (list, tuple, set)):
        return tuple(
            dict.fromkeys(str(item).strip().lower() for item in value if str(item).strip())
        )
    return ()


@dataclass(frozen=True)
class SolverRecipe:
    recipe_id: str
    name: str
    url: str = ""
    meal_types: tuple[str, ...] = ()
    calories: float = 0.0
    protein: float = 0.0
    carbs: float = 0.0
    fat: float = 0.0
    fiber: float = 0.0
    is_main_course: bool = False
    is_side_dish: bool = False


@dataclass(frozen=True)
class SolverConfig:
    num_days: int = 3
    meal_calorie_ratio: dict[str, float] = field(default_factory=lambda: dict(DEFAULT_MEAL_CALORIE_RATIO))
    meal_satiety_ratio: dict[str, float] = field(default_factory=lambda: dict(DEFAULT_MEAL_SATIETY_RATIO))
    calorie_buffer_pct: float = DEFAULT_CALORIE_BUFFER_PCT
    max_solutions: int = 1
    main_course_min_servings: int = DEFAULT_MAIN_COURSE_MIN_SERVINGS
    main_course_max_servings: int = DEFAULT_MAIN_COURSE_MAX_SERVINGS
    time_limit_seconds: int = DEFAULT_SOLVER_TIME_LIMIT_SECONDS

    def __post_init__(self) -> None:
        # Keep validation close to the config object so callers fail fast before
        # building the CP-SAT model.
        if self.num_days < 1:
            raise ValueError("num_days must be >= 1")
        if self.max_solutions < 1 or self.max_solutions > 3:
            raise ValueError("max_solutions must be between 1 and 3")
        if not 0 <= self.calorie_buffer_pct < 1:
            raise ValueError("calorie_buffer_pct must be in [0, 1)")
        if self.main_course_min_servings < 0:
            raise ValueError("main_course_min_servings must be >= 0")
        if self.main_course_max_servings < 1:
            raise ValueError("main_course_max_servings must be >= 1")
        if self.main_course_min_servings > self.main_course_max_servings:
            raise ValueError("main_course_min_servings must be <= main_course_max_servings")
        if self.main_course_max_servings > MAX_SERVINGS_PER_RECIPE:
            raise ValueError("main_course_max_servings cannot exceed MAX_SERVINGS_PER_RECIPE")
        _validate_ratio_triplet(self.meal_calorie_ratio, "meal_calorie_ratio")
        _validate_ratio_triplet(self.meal_satiety_ratio, "meal_satiety_ratio")


@dataclass(frozen=True)
class PlannedRecipe:
    recipe_id: str
    name: str
    servings: float
    url: str
    nutrients: dict[str, float]


@dataclass(frozen=True)
class PlanResult:
    patient_id: str
    num_days: int
    objective_value: float
    calorie_buffer_pct: float
    recommended: dict[str, float]
    meal_calorie_ratio: dict[str, float]
    meal_satiety_ratio: dict[str, float]
    daily_totals: dict[int, dict[str, float]]
    daily_satiety_by_meal: dict[int, dict[str, float]]
    daily_satiety_total: dict[int, float]
    totals: dict[str, float]
    picks: dict[int, dict[str, list[PlannedRecipe]]]


@dataclass(frozen=True)
class SolverInputDiagnostics:
    total_recipes: int
    prefilter_counts: dict[str, int]
    postfilter_counts: dict[str, int]
    allowed_recipe_ids: tuple[str, ...]


@dataclass(frozen=True)
class SolverInputBundle:
    patient_id: str
    profile: dict[str, Any]
    targets: dict[str, float]
    recipes: tuple[SolverRecipe, ...]
    candidates: dict[str, tuple[SolverRecipe, ...]]
    diagnostics: SolverInputDiagnostics | None = None


@dataclass(frozen=True)
class GeneratedMealPlanEntry:
    patient_id: str
    week_start: str | None
    day_index: int
    meal_type: str
    recipe_id: str
    servings: float
    entry_order: int


@dataclass(frozen=True)
class MealGenerationResult:
    patient_id: str
    week_start: str | None
    inputs: SolverInputBundle
    plans: tuple[PlanResult, ...]
    selected_plan: PlanResult
    entries: tuple[GeneratedMealPlanEntry, ...]


def _validate_ratio_triplet(values: dict[str, float], label: str) -> None:
    for meal in MEALS:
        if float(values.get(meal, 0)) <= 0:
            raise ValueError(f"{label} must include a positive value for {meal}")
    if abs(sum(float(values[meal]) for meal in MEALS) - 1.0) > 1e-6:
        raise ValueError(f"{label} must sum to 1.0")


def normalize_recipe(record: dict[str, Any]) -> SolverRecipe:
    # Normalize both seed data and DB rows into one solver-facing recipe shape.
    tags = _clean_tags(record.get("tags"))
    category = str(record.get("category") or "")
    category_lc = category.strip().lower()
    meal_types_raw = record.get("meal_types")
    if meal_types_raw is None:
        meal_types_raw = record.get("mealTypes")

    if meal_types_raw is None:
        meal_types = _derive_meal_types(category)
    else:
        meal_types = _parse_str_list(meal_types_raw)

    recipe_id = str(
        record.get("recipe_id")
        or record.get("recipeId")
        or record.get("id")
        or ""
    ).removeprefix("r")
    if not recipe_id:
        raise ValueError("recipe record is missing an id")

    is_main_course = bool(record.get("is_main_course")) or _contains_any(
        category_lc, ("main course", "main", "entree")
    ) or any(tag in {"main_course", "main", "entree"} for tag in tags)
    is_side_dish = bool(record.get("is_side_dish")) or _contains_any(
        category_lc, ("side dish", "side")
    ) or any(tag in {"side_dish", "side"} for tag in tags)

    return SolverRecipe(
        recipe_id=recipe_id,
        name=str(record.get("name") or f"Recipe {recipe_id}"),
        url=str(record.get("url") or record.get("sourceUrl") or ""),
        meal_types=meal_types,
        calories=parse_float(record.get("calories"), 0.0),
        protein=parse_float(record.get("protein"), 0.0),
        carbs=parse_float(record.get("carbs", record.get("total_carbs")), 0.0),
        fat=parse_float(record.get("fat"), 0.0),
        fiber=parse_float(record.get("fiber"), 0.0),
        is_main_course=is_main_course,
        is_side_dish=is_side_dish,
    )
