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
