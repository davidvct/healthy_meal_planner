// Health condition rules: per-meal nutrient limits that trigger warnings
const CONDITION_RULES = {
  "High Blood Sugar": {
    limit: { carbs: 60, sugar: 15 },
    warnNutrient: "carbs",
    warnLabel: "High Carbohydrate",
  },
  "High Cholesterol": {
    limit: { cholesterol: 100, fat: 25 },
    warnNutrient: "cholesterol",
    warnLabel: "High Cholesterol",
  },
  "Hypertension": {
    limit: { sodium: 700 },
    warnNutrient: "sodium",
    warnLabel: "High Sodium",
  },
};

module.exports = { CONDITION_RULES };
