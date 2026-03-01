from __future__ import annotations

import csv
import re
from functools import lru_cache
from pathlib import Path
from typing import Any

# Fallback locations if datasets are not copied into the repo.
_DATASET_CANDIDATES = [
    Path(__file__).resolve().parent / "datasets",
    Path.cwd() / "datasets",
    Path.home() / "Downloads" / "CS5224 Datasets",
]

_RECIPES_FILE = "recipes_nlp_tagged.csv"
_PROFILE_FILE = "Personalized_Diet_Recommendations.csv"

_TRUE_VALUES = {"true", "1", "yes", "y"}

_UNIT_TO_GRAMS = {
    "cup": 240.0,
    "cups": 240.0,
    "tbsp": 15.0,
    "tablespoon": 15.0,
    "tablespoons": 15.0,
    "tsp": 5.0,
    "teaspoon": 5.0,
    "teaspoons": 5.0,
    "oz": 28.35,
    "ounce": 28.35,
    "ounces": 28.35,
    "lb": 453.6,
    "lbs": 453.6,
    "pound": 453.6,
    "pounds": 453.6,
    "g": 1.0,
    "gram": 1.0,
    "grams": 1.0,
    "kg": 1000.0,
    "ml": 1.0,
    "l": 1000.0,
    "clove": 5.0,
    "cloves": 5.0,
    "slice": 25.0,
    "slices": 25.0,
    "large": 50.0,
    "medium": 35.0,
    "small": 20.0,
}

_CONDITION_TO_CATEGORY_COL = {
    "Hypertension": "hypertension_category",
    "High Blood Sugar": "diabetes_category",
    "High Cholesterol": "cholesterol_category",
}


def _find_dataset_dir() -> Path | None:
    for candidate in _DATASET_CANDIDATES:
        if (candidate / _RECIPES_FILE).exists() and (candidate / _PROFILE_FILE).exists():
            return candidate
    return None


def _parse_bool(value: Any) -> bool:
    return str(value or "").strip().lower() in _TRUE_VALUES


def _parse_float(value: Any) -> float:
    if value is None:
        return 0.0
    text = str(value).strip().lower()
    if not text:
        return 0.0
    text = re.sub(r"[^0-9.\-]", "", text)
    if not text or text == "-":
        return 0.0
    try:
        return float(text)
    except ValueError:
        return 0.0


def _split_csv_text(value: str) -> list[str]:
    if not value:
        return []
    return [item.strip() for item in value.split(",") if item.strip()]


def _parse_steps(instructions: str) -> list[str]:
    if not instructions:
        return []

    normalized = instructions.replace("\r", "\n")
    lines = [line.strip() for line in normalized.split("\n") if line.strip()]
    if len(lines) > 1:
        return [re.sub(r"^\d+[.)]\s*", "", line).strip() for line in lines]

    # Fallback for single-line instructions with numeric points.
    chunks = re.split(r"\s+(?=\d+[.)]\s)", normalized)
    steps = [re.sub(r"^\d+[.)]\s*", "", c).strip() for c in chunks if c.strip()]
    return steps or [normalized.strip()]


def _fraction_to_float(text: str) -> float:
    text = text.strip()
    if "/" in text:
        parts = text.split("/", 1)
        try:
            numerator = float(parts[0])
            denominator = float(parts[1])
            if denominator == 0:
                return 0.0
            return numerator / denominator
        except ValueError:
            return 0.0
    try:
        return float(text)
    except ValueError:
        return 0.0


def _parse_quantity(value: str) -> float:
    text = value.strip()
    if not text:
        return 0.0

    # Handle ranges: 1-2, 1 to 2
    range_match = re.match(r"^([0-9./]+)\s*(?:-|to)\s*([0-9./]+)$", text)
    if range_match:
        left = _fraction_to_float(range_match.group(1))
        right = _fraction_to_float(range_match.group(2))
        return (left + right) / 2.0

    # Handle mixed number: 1 1/2
    mixed_match = re.match(r"^(\d+)\s+([0-9]+/[0-9]+)$", text)
    if mixed_match:
        whole = float(mixed_match.group(1))
        frac = _fraction_to_float(mixed_match.group(2))
        return whole + frac

    return _fraction_to_float(text)


def _normalize_ingredient_name(raw: str) -> str:
    text = raw.strip().lower()
    text = re.sub(r"\([^)]*\)", "", text)
    text = text.split(",", 1)[0]
    text = re.sub(r"\b(chopped|diced|minced|sliced|fresh|ground|optional|to taste|divided)\b", "", text)
    text = re.sub(r"\s+", " ", text).strip(" -")
    return text or "mixed ingredients"


def _parse_ingredients(ingredients_text: str) -> dict[str, float]:
    if not ingredients_text:
        return {"mixed ingredients": 100.0}

    raw_lines = [line.strip() for line in ingredients_text.replace("\r", "\n").split("\n") if line.strip()]
    if not raw_lines:
        return {"mixed ingredients": 100.0}

    result: dict[str, float] = {}
    for line in raw_lines:
        item = line.lstrip("-* ").strip()
        if not item:
            continue

        # Extract quantity + unit at the beginning when present.
        match = re.match(
            r"^(?P<qty>[0-9./]+(?:\s+[0-9./]+)?(?:\s*(?:-|to)\s*[0-9./]+)?)?\s*"
            r"(?P<unit>[a-zA-Z]+)?\s*(?P<name>.*)$",
            item,
        )

        grams = 100.0
        name = item
        if match:
            qty_text = (match.group("qty") or "").strip()
            unit = (match.group("unit") or "").strip().lower()
            name = (match.group("name") or "").strip() or item

            if qty_text:
                qty = _parse_quantity(qty_text)
                if qty <= 0:
                    qty = 1.0
                factor = _UNIT_TO_GRAMS.get(unit, 100.0)
                grams = qty * factor
            elif unit in _UNIT_TO_GRAMS:
                grams = _UNIT_TO_GRAMS[unit]

        ingredient_name = _normalize_ingredient_name(name)
        result[ingredient_name] = result.get(ingredient_name, 0.0) + max(1.0, grams)

    return result or {"mixed ingredients": 100.0}


def _derive_meal_types(category: str) -> list[str]:
    c = (category or "").lower()
    meal_types: list[str] = []

    if "breakfast" in c:
        meal_types.append("breakfast")
    if "snack" in c or "dessert" in c or "drink" in c or "beverage" in c or "appetizer" in c:
        meal_types.append("snack")
    if "lunch" in c:
        meal_types.append("lunch")
    if "dinner" in c:
        meal_types.append("dinner")
    if "main" in c or "entree" in c or "soup" in c or "salad" in c or "side" in c:
        meal_types.extend(["lunch", "dinner"])

    if not meal_types:
        meal_types = ["lunch", "dinner"]

    # Preserve order and remove duplicates.
    seen = set()
    deduped = []
    for mt in meal_types:
        if mt not in seen:
            seen.add(mt)
            deduped.append(mt)
    return deduped


def _build_tags(row: dict[str, Any]) -> list[str]:
    tags: list[str] = []
    tags.extend([t.lower() for t in _split_csv_text(row.get("cuisine", ""))])
    tags.extend([t.lower() for t in _split_csv_text(row.get("category", ""))])

    if _parse_bool(row.get("is_vegetarian")):
        tags.append("vegetarian")
    if _parse_bool(row.get("is_vegan")):
        tags.append("vegan")
    if _parse_bool(row.get("is_gluten_free")):
        tags.append("gluten_free")
    if _parse_bool(row.get("is_dairy_free")):
        tags.append("dairy_free")
    if _parse_bool(row.get("is_low_carb")):
        tags.append("low_carb")
    if _parse_bool(row.get("is_high_protein")):
        tags.append("high_protein")
    if _parse_bool(row.get("is_spicy")):
        tags.append("spicy")
    if _parse_bool(row.get("is_sweet")):
        tags.append("sweet")
    if _parse_bool(row.get("is_salty")):
        tags.append("salty")

    seen = set()
    deduped = []
    for tag in tags:
        cleaned = re.sub(r"\s+", "_", tag.strip().lower())
        if cleaned and cleaned not in seen:
            seen.add(cleaned)
            deduped.append(cleaned)
    return deduped


def _normalize_allergies_text(value: str) -> list[str]:
    text = (value or "").strip()
    if not text:
        return []

    # Example: Gluten(41%), Nuts(60%), Eggs(80%)
    parts = [p.strip() for p in text.split(",") if p.strip()]
    allergies = []
    for part in parts:
        allergy = re.sub(r"\([^)]*\)", "", part).strip().lower()
        allergy = allergy.replace("eggs", "egg").replace("nuts", "nut")
        if allergy:
            allergies.append(allergy)
    return allergies


def _diet_label(row: dict[str, Any]) -> str:
    if _parse_bool(row.get("is_vegan")):
        return "vegan"
    if _parse_bool(row.get("is_vegetarian")):
        return "vegetarian"
    if _parse_bool(row.get("is_low_carb")):
        return "low_carb"
    if _parse_bool(row.get("is_keto")):
        return "keto"
    return "none"


def _profile_distance(
    profile: dict[str, Any],
    age: int | None,
    sex: str | None,
    weight_kg: float | None,
    diet: str,
) -> float:
    score = 0.0

    if age is not None:
        score += abs(profile["age"] - age)
    else:
        score += 10.0

    if weight_kg is not None:
        score += abs(profile["weight_kg"] - weight_kg) * 0.2

    normalized_sex = (sex or "").strip().lower()
    if normalized_sex and normalized_sex != profile["gender"]:
        score += 15.0

    normalized_diet = (diet or "none").strip().lower()
    if normalized_diet != "none" and normalized_diet not in profile["dietary_habits"]:
        score += 5.0

    return score


@lru_cache(maxsize=1)
def load_profiles_dataset() -> list[dict[str, Any]]:
    dataset_dir = _find_dataset_dir()
    if dataset_dir is None:
        return []

    file_path = dataset_dir / _PROFILE_FILE
    profiles: list[dict[str, Any]] = []

    with file_path.open("r", encoding="utf-8-sig", newline="") as f:
        reader = csv.DictReader(f)
        for row in reader:
            profiles.append(
                {
                    "patient_id": row.get("Patient_ID", ""),
                    "age": int(_parse_float(row.get("Age"))),
                    "gender": (row.get("Gender") or "").strip().lower(),
                    "weight_kg": _parse_float(row.get("Weight_kg")),
                    "dietary_habits": (row.get("Dietary_Habits") or "").strip().lower(),
                    "recommended_calories": _parse_float(row.get("Recommended_Calories")),
                    "recommended_protein": _parse_float(row.get("Recommended_Protein")),
                    "recommended_carbs": _parse_float(row.get("Recommended_Carbs")),
                    "recommended_fats": _parse_float(row.get("Recommended_Fats")),
                }
            )

    return profiles


def recommend_targets(
    age: int | None,
    sex: str | None,
    weight_kg: float | None,
    diet: str,
) -> dict[str, float]:
    profiles = load_profiles_dataset()
    if not profiles:
        return {
            "calories": 2000.0,
            "protein": 50.0,
            "carbs": 275.0,
            "fat": 65.0,
        }

    best = min(
        profiles,
        key=lambda p: _profile_distance(p, age, sex, weight_kg, diet),
    )

    return {
        "calories": best["recommended_calories"] or 2000.0,
        "protein": best["recommended_protein"] or 50.0,
        "carbs": best["recommended_carbs"] or 275.0,
        "fat": best["recommended_fats"] or 65.0,
    }


@lru_cache(maxsize=1)
def load_seed_data() -> dict[str, Any]:
    dataset_dir = _find_dataset_dir()
    if dataset_dir is None:
        raise FileNotFoundError(
            "Could not find dataset directory containing recipes_nlp_tagged.csv and "
            "Personalized_Diet_Recommendations.csv"
        )

    recipes_path = dataset_dir / _RECIPES_FILE
    stat = recipes_path.stat()
    data_version = f"recipes:{int(stat.st_mtime)}:{stat.st_size}"

    dishes: list[dict[str, Any]] = []
    recipes: dict[str, dict[str, Any]] = {}
    ingredient_names: set[str] = set()

    with recipes_path.open("r", encoding="utf-8-sig", newline="") as f:
        reader = csv.DictReader(f)

        for idx, row in enumerate(reader, start=1):
            dish_id = f"d{idx}"
            recipe_id = f"r{idx}"

            ingredients = _parse_ingredients(row.get("ingredients", ""))
            ingredient_names.update(ingredients.keys())

            tags = _build_tags(row)
            meal_types = _derive_meal_types(row.get("category", ""))
            name = (row.get("name") or "").strip() or f"Recipe {idx}"

            dish_record = {
                "id": dish_id,
                "name": name,
                "mealTypes": meal_types,
                "tags": tags,
                "ingredients": ingredients,
                "recipeId": recipe_id,
                "baseServings": 1,
                "description": (row.get("description") or "").strip(),
                "sourceUrl": (row.get("url") or "").strip(),
                "imageUrl": (row.get("image_url") or "").strip(),
                "calories": _parse_float(row.get("calories")),
                "protein": _parse_float(row.get("protein")),
                "carbs": _parse_float(row.get("total_carbs")),
                "fat": _parse_float(row.get("fat")),
                "fiber": _parse_float(row.get("fiber")),
                "sodium": _parse_float(row.get("sodium")),
                "cholesterol": _parse_float(row.get("cholesterol")),
                "sugar": _parse_float(row.get("sugar")),
                "allergies": _normalize_allergies_text(row.get("Allergies", "")),
                "dietLabel": _diet_label(row),
                "hypertensionCategory": (row.get("hypertension_category") or "").strip(),
                "diabetesCategory": (row.get("diabetes_category") or "").strip(),
                "cholesterolCategory": (row.get("cholesterol_category") or "").strip(),
            }
            dishes.append(dish_record)

            recipes[recipe_id] = {
                "name": name,
                "prepTime": int(_parse_float(row.get("prep_time"))),
                "cookTime": int(_parse_float(row.get("cook_time"))),
                "steps": _parse_steps(row.get("instructions", "")),
            }

    ingredients_nutrients = {
        ingredient_name: [0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0]
        for ingredient_name in sorted(ingredient_names)
    }

    return {
        "version": data_version,
        "ingredients": ingredients_nutrients,
        "dishes": dishes,
        "recipes": recipes,
        "conditionCategoryColumns": _CONDITION_TO_CATEGORY_COL,
    }
