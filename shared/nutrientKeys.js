// Shared between frontend and backend
// Nutrient keys in the order stored in INGREDIENTS_NUTRIENTS arrays
const NUTRIENT_KEYS = [
  "calories",
  "protein",
  "carbs",
  "fat",
  "fiber",
  "sodium",
  "cholesterol",
  "sugar",
];

// Recommended Daily Allowances
const RDA = {
  calories: 2000,
  protein: 50,
  carbs: 275,
  fat: 65,
  fiber: 28,
  sodium: 2300,
  cholesterol: 300,
  sugar: 50,
};

module.exports = { NUTRIENT_KEYS, RDA };
