NUTRIENT_KEYS = [
    "calories",
    "protein",
    "carbs",
    "fat",
    "fiber",
    "sodium",
    "cholesterol",
    "sugar",
]

RDA = {
    "calories": 2400,
    "protein": 75,
    "carbs": 325,
    "fat": 90,
    "fiber": 28,
    "sodium": 2300,
    "cholesterol": 300,
    "sugar": 50,
    "saturated_fat": 20,
    "trans_fat": 2,
    "net_carbs": 250,
    "vitamin_c": 90,
    "potassium": 2600,
    "calcium": 1000,
    "iron": 18,
}

# All nutrient columns available in the recipes table (used by thresholds).
# Maps column_name → (display_label, unit).
NUTRIENT_COLUMNS = {
    "calories":       ("Calories", "kcal"),
    "protein":        ("Protein", "g"),
    "total_carbs":    ("Carbs", "g"),
    "fat":            ("Fat", "g"),
    "fiber":          ("Fiber", "g"),
    "sugar":          ("Sugar", "g"),
    "sodium":         ("Sodium", "mg"),
    "cholesterol":    ("Cholesterol", "mg"),
    "saturated_fat":  ("Saturated Fat", "g"),
    "trans_fat":      ("Trans Fat", "g"),
    "net_carbs":      ("Net Carbs", "g"),
    "vitamin_c":      ("Vitamin C", "mg"),
    "potassium":      ("Potassium", "mg"),
    "calcium":        ("Calcium", "mg"),
    "iron":           ("Iron", "mg"),
}

# Maps DB column → canonical nutrient key used in thresholds.
NUTRIENT_COL_TO_KEY = {
    "total_carbs": "carbs",
}

# Unified condition configuration — single source of truth for all three
CONDITION_CONFIG: dict = {
    "High Blood Sugar": {
        # DB column that holds the NLP-tagged suitability label for this condition
        "category_column": "diabetes_category",
        # Per-meal nutrient hard limits used by the filter and weekly warnings
        "per_meal_limits": {"carbs": 60, "sugar": 15},
        "warn_nutrient": "carbs",
        "warn_label": "High Carbohydrate",
        # Daily solver targets — more restrictive than healthy defaults
        "daily_targets": {
            "protein": 65.0, "carbs": 250.0, "fat": 55.0,
            "sugar": 25.0, "sodium": 2000.0, "fiber": 30.0,
        },
    },
    "High Cholesterol": {
        "category_column": "cholesterol_category",
        "per_meal_limits": {"cholesterol": 100, "fat": 25},
        "warn_nutrient": "cholesterol",
        "warn_label": "High Cholesterol",
        "daily_targets": {
            "protein": 60.0, "carbs": 275.0, "fat": 55.0,
            "sugar": 50.0, "sodium": 2000.0, "fiber": 30.0,
        },
    },
    "Hypertension": {
        "category_column": "hypertension_category",
        "per_meal_limits": {"sodium": 700},
        "warn_nutrient": "sodium",
        "warn_label": "High Sodium",
        "daily_targets": {
            "protein": 60.0, "carbs": 250.0, "fat": 55.0,
            "sugar": 50.0, "sodium": 1500.0, "fiber": 30.0,
        },
    },
}

CONDITION_RULES = {
    name: {
        "limit": cfg["per_meal_limits"],
        "warnNutrient": cfg["warn_nutrient"],
        "warnLabel": cfg["warn_label"],
    }
    for name, cfg in CONDITION_CONFIG.items()
}

MEAL_TYPES = ["breakfast", "lunch", "dinner", "snack"]
MEAL_CUTOFF = {"breakfast": 10, "lunch": 14, "dinner": 20}
