const { NUTRIENT_KEYS, RDA } = require("../../../shared/nutrientKeys");
const { CONDITION_RULES } = require("../data/conditionRules");
const { getDishNutrients, getDayNutrients } = require("./nutrientCalculator");

const MEAL_TYPES = ["breakfast", "lunch", "dinner", "snack"];

function getWarnings(nutrients, conditions) {
  const warnings = [];
  for (const c of conditions) {
    const rule = CONDITION_RULES[c];
    if (!rule) continue;
    for (const [nutrient, limit] of Object.entries(rule.limit)) {
      if (nutrients[nutrient] > limit) {
        warnings.push(rule.warnLabel);
        break;
      }
    }
  }
  return [...new Set(warnings)];
}

function getEntryWarnings(entry, dishIngredients, conditions) {
  const ingredients = typeof dishIngredients === "string"
    ? JSON.parse(dishIngredients) : dishIngredients;
  const customIngs = entry.custom_ingredients
    ? (typeof entry.custom_ingredients === "string" ? JSON.parse(entry.custom_ingredients) : entry.custom_ingredients)
    : null;
  const nutrients = getDishNutrients({ ingredients }, entry.servings, customIngs);
  return getWarnings(nutrients, conditions);
}

function scoreDish(dish, userConditions, dayEntries, mealType, allWeekEntries) {
  const ingredients = typeof dish.ingredients === "string"
    ? JSON.parse(dish.ingredients) : dish.ingredients;
  const mealTypes = typeof dish.meal_types === "string"
    ? JSON.parse(dish.meal_types) : (dish.mealTypes || dish.meal_types);

  const dn = getDishNutrients({ ingredients });
  const dayN = getDayNutrients(dayEntries);

  // Health condition safety score (0-60)
  let healthScore = 60;
  for (const c of userConditions) {
    const rule = CONDITION_RULES[c];
    if (!rule) continue;
    for (const [nutrient, limit] of Object.entries(rule.limit)) {
      const ratio = dn[nutrient] / limit;
      if (ratio > 1.2) healthScore -= 24;
      else if (ratio > 0.8) healthScore -= 10;
    }
  }
  healthScore = Math.max(0, healthScore);

  // Nutrient balance score (0-30)
  const remaining = {};
  NUTRIENT_KEYS.forEach(k => remaining[k] = Math.max(0, RDA[k] - dayN[k]));

  let nutrientScore = 0;
  const importantNutrients = ["protein", "fiber", "calories"];
  const limitNutrients = ["sodium", "cholesterol", "sugar"];

  importantNutrients.forEach(k => {
    if (remaining[k] > 0) {
      const fillRatio = Math.min(1, dn[k] / (remaining[k] * 0.4));
      nutrientScore += fillRatio * 7;
    }
  });

  limitNutrients.forEach(k => {
    const headroom = remaining[k];
    if (headroom > 0 && dn[k] <= headroom) {
      nutrientScore += 3;
    } else if (dn[k] > headroom * 1.2) {
      nutrientScore -= 2;
    }
  });
  nutrientScore = Math.max(0, Math.min(30, nutrientScore));

  // User preference score (0-10)
  let prefScore = 0;

  // Variety: penalize repeated dishes across the week
  const count = allWeekEntries.filter(e => e.dish_id === dish.id).length;
  prefScore += Math.max(0, 5 - count * 2);

  // Meal appropriateness
  prefScore += mealTypes.includes(mealType) ? 5 : 1;

  const total = Math.round(Math.max(0, Math.min(100, healthScore + nutrientScore + prefScore)));
  return {
    total,
    healthScore: Math.round(healthScore),
    nutrientScore: Math.round(nutrientScore),
    prefScore: Math.round(prefScore),
  };
}

function filterDishes(dishes, userProfile, mealType, options = {}) {
  const { filterMealType = true, filterDiet = true, filterAllergies = true, filterConditions = true } = options;

  return dishes.filter(d => {
    const ingredients = typeof d.ingredients === "string" ? JSON.parse(d.ingredients) : d.ingredients;
    const tags = typeof d.tags === "string" ? JSON.parse(d.tags) : d.tags;
    const mealTypes = typeof d.meal_types === "string" ? JSON.parse(d.meal_types) : (d.mealTypes || d.meal_types);

    // Allergy filter
    if (filterAllergies) {
      for (const allergy of (userProfile.allergies || [])) {
        if (ingredients[allergy] !== undefined) return false;
      }
    }

    // Diet filter
    if (filterDiet && userProfile.diet !== "none") {
      if (userProfile.diet === "vegetarian" && !tags.includes("vegetarian") && (
        ingredients["chicken breast"] || ingredients["fish"] || ingredients["shrimp"] || ingredients["anchovies"]
      )) return false;
      if (userProfile.diet === "vegan" && (
        ingredients["chicken breast"] || ingredients["fish"] || ingredients["shrimp"] || ingredients["anchovies"] || ingredients["egg"] || ingredients["butter"]
      )) return false;
      if (userProfile.diet === "pescatarian" && ingredients["chicken breast"]) return false;
    }

    // Meal type filter
    if (filterMealType && !mealTypes.includes(mealType)) return false;

    // Health condition filter
    if (filterConditions && (userProfile.conditions || []).length > 0) {
      const nutrients = getDishNutrients({ ingredients });
      const w = getWarnings(nutrients, userProfile.conditions);
      if (w.length > 0) return false;
    }

    return true;
  });
}

module.exports = {
  getWarnings,
  getEntryWarnings,
  scoreDish,
  filterDishes,
  CONDITION_RULES,
  MEAL_TYPES,
};
