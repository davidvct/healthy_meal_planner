const { NUTRIENT_KEYS, RDA } = require("../../../shared/nutrientKeys");
const { getDb } = require("../db");

// Cache ingredient nutrients in memory after first load
let ingredientCache = null;

function loadIngredients() {
  if (ingredientCache) return ingredientCache;
  const db = getDb();
  const rows = db.prepare("SELECT * FROM ingredients").all();
  ingredientCache = {};
  for (const row of rows) {
    ingredientCache[row.id] = [
      row.calories, row.protein_g, row.carbs_g, row.fat_g,
      row.fiber_g, row.sodium_mg, row.cholesterol_mg, row.sugar_g,
    ];
  }
  return ingredientCache;
}

function getNutrientsFromIngredients(ingredientsObj) {
  const nutrients = loadIngredients();
  const n = { calories: 0, protein: 0, carbs: 0, fat: 0, fiber: 0, sodium: 0, cholesterol: 0, sugar: 0 };
  for (const [ing, amountG] of Object.entries(ingredientsObj)) {
    const nd = nutrients[ing];
    if (!nd) {
      console.warn(`[MealWise] Unknown ingredient "${ing}" — nutrients will be zero.`);
      continue;
    }
    const scale = amountG / 100;
    NUTRIENT_KEYS.forEach((k, i) => { n[k] += nd[i] * scale; });
  }
  Object.keys(n).forEach(k => n[k] = Math.round(n[k] * 10) / 10);
  return n;
}

// When customIngredients is provided, it already contains final gram amounts
function getDishNutrients(dish, servings = 1, customIngredients = null) {
  const ingredients = typeof dish.ingredients === "string"
    ? JSON.parse(dish.ingredients) : dish.ingredients;
  if (customIngredients) return getNutrientsFromIngredients(customIngredients);
  const scaled = {};
  for (const [ing, amountG] of Object.entries(ingredients)) {
    scaled[ing] = amountG * servings;
  }
  return getNutrientsFromIngredients(scaled);
}

function getDayNutrients(entries) {
  const n = { calories: 0, protein: 0, carbs: 0, fat: 0, fiber: 0, sodium: 0, cholesterol: 0, sugar: 0 };
  for (const entry of entries) {
    const ingredients = typeof entry.ingredients === "string"
      ? JSON.parse(entry.ingredients) : entry.ingredients;
    const customIngs = entry.custom_ingredients
      ? (typeof entry.custom_ingredients === "string" ? JSON.parse(entry.custom_ingredients) : entry.custom_ingredients)
      : null;
    const dn = getDishNutrients({ ingredients }, entry.servings, customIngs);
    NUTRIENT_KEYS.forEach(k => n[k] += dn[k]);
  }
  Object.keys(n).forEach(k => n[k] = Math.round(n[k] * 10) / 10);
  return n;
}

function getWeekNutrients(allEntries) {
  const n = { calories: 0, protein: 0, carbs: 0, fat: 0, fiber: 0, sodium: 0, cholesterol: 0, sugar: 0 };
  for (const entry of allEntries) {
    const ingredients = typeof entry.ingredients === "string"
      ? JSON.parse(entry.ingredients) : entry.ingredients;
    const customIngs = entry.custom_ingredients
      ? (typeof entry.custom_ingredients === "string" ? JSON.parse(entry.custom_ingredients) : entry.custom_ingredients)
      : null;
    const dn = getDishNutrients({ ingredients }, entry.servings, customIngs);
    NUTRIENT_KEYS.forEach(k => n[k] += dn[k]);
  }
  Object.keys(n).forEach(k => n[k] = Math.round(n[k] * 10) / 10);
  return n;
}

module.exports = {
  getNutrientsFromIngredients,
  getDishNutrients,
  getDayNutrients,
  getWeekNutrients,
  RDA,
  NUTRIENT_KEYS,
};
