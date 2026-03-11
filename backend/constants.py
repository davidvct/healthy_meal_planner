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
    "calories": 2000,
    "protein": 50,
    "carbs": 275,
    "fat": 65,
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

CONDITION_RULES = {
    "High Blood Sugar": {
        "limit": {"carbs": 60, "sugar": 15},
        "warnNutrient": "carbs",
        "warnLabel": "High Carbohydrate",
    },
    "High Cholesterol": {
        "limit": {"cholesterol": 100, "fat": 25},
        "warnNutrient": "cholesterol",
        "warnLabel": "High Cholesterol",
    },
    "Hypertension": {
        "limit": {"sodium": 700},
        "warnNutrient": "sodium",
        "warnLabel": "High Sodium",
    },
}

MEAL_TYPES = ["breakfast", "lunch", "dinner", "snack"]
MEAL_CUTOFF = {"breakfast": 10, "lunch": 14, "dinner": 20}
