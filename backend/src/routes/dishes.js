const express = require("express");
const router = express.Router();
const { getDb } = require("../db");
const { getDishNutrients } = require("../services/nutrientCalculator");
const { scoreDish, filterDishes, getWarnings } = require("../services/recommendationEngine");

// GET /api/dishes — list all dishes with optional filtering
router.get("/", (req, res) => {
  const db = getDb();
  const dishes = db.prepare("SELECT * FROM dishes").all();

  // Parse JSON fields for response
  const parsed = dishes.map(d => ({
    ...d,
    mealTypes: JSON.parse(d.meal_types),
    tags: JSON.parse(d.tags),
    ingredients: JSON.parse(d.ingredients),
  }));

  res.json(parsed);
});

// GET /api/dishes/:id — full dish detail with recipe and nutrients
router.get("/:id", (req, res) => {
  const db = getDb();
  const dish = db.prepare("SELECT * FROM dishes WHERE id = ?").get(req.params.id);
  if (!dish) return res.status(404).json({ error: "Dish not found" });

  const recipe = dish.recipe_id
    ? db.prepare("SELECT * FROM recipes WHERE id = ?").get(dish.recipe_id)
    : null;

  const ingredients = JSON.parse(dish.ingredients);
  const nutrients = getDishNutrients({ ingredients });

  res.json({
    ...dish,
    mealTypes: JSON.parse(dish.meal_types),
    tags: JSON.parse(dish.tags),
    ingredients,
    nutrients,
    recipe: recipe ? {
      ...recipe,
      steps: JSON.parse(recipe.steps),
    } : null,
  });
});

// GET /api/dishes/recommend?day=0&mealType=lunch&userId=xxx
// Returns scored + filtered dish list for a specific meal slot
router.get("/recommend/:userId", (req, res) => {
  const db = getDb();
  const { day, mealType, filterMealType, filterDiet, filterAllergies, filterConditions, search, weekStart } = req.query;
  const dayIndex = parseInt(day) || 0;
  const ws = weekStart || getCurrentWeekStart();

  // Load user profile
  const user = db.prepare("SELECT * FROM users WHERE id = ?").get(req.params.userId);
  if (!user) return res.status(404).json({ error: "User not found" });

  const userProfile = {
    conditions: JSON.parse(user.conditions),
    diet: user.diet,
    allergies: JSON.parse(user.allergies),
  };

  // Load all dishes
  const allDishes = db.prepare("SELECT * FROM dishes").all();

  // Load meal plan entries for scoring context (filtered by week)
  const dayEntries = db.prepare(`
    SELECT mp.*, d.ingredients
    FROM meal_plans mp
    JOIN dishes d ON d.id = mp.dish_id
    WHERE mp.user_id = ? AND mp.week_start = ? AND mp.day_index = ?
  `).all(req.params.userId, ws, dayIndex);

  const allWeekEntries = db.prepare(`
    SELECT mp.dish_id FROM meal_plans mp WHERE mp.user_id = ? AND mp.week_start = ?
  `).all(req.params.userId, ws);

  // Filter
  const filtered = filterDishes(allDishes, userProfile, mealType, {
    filterMealType: filterMealType !== "false",
    filterDiet: filterDiet !== "false",
    filterAllergies: filterAllergies !== "false",
    filterConditions: filterConditions !== "false",
  });

  // Search
  let results = filtered;
  if (search && search.trim()) {
    const q = search.toLowerCase();
    results = filtered.filter(d => {
      const tags = typeof d.tags === "string" ? JSON.parse(d.tags) : d.tags;
      return d.name.toLowerCase().includes(q) || tags.some(t => t.includes(q));
    });
  }

  // Score and sort
  const scored = results.map(d => {
    const ingredients = typeof d.ingredients === "string" ? JSON.parse(d.ingredients) : d.ingredients;
    const nutrients = getDishNutrients({ ingredients });
    const score = scoreDish(d, userProfile.conditions, dayEntries, mealType, allWeekEntries);
    const warnings = getWarnings(nutrients, userProfile.conditions);

    return {
      dish: {
        ...d,
        mealTypes: typeof d.meal_types === "string" ? JSON.parse(d.meal_types) : d.meal_types,
        tags: typeof d.tags === "string" ? JSON.parse(d.tags) : d.tags,
        ingredients,
      },
      score,
      warnings,
      nutrients,
    };
  }).sort((a, b) => b.score.total - a.score.total);

  // Also return day nutrients for the "today's intake" display
  const { getDayNutrients } = require("../services/nutrientCalculator");
  const dayNutrients = getDayNutrients(dayEntries);

  res.json({ scored, dayNutrients });
});

// Helper: get Monday of the current week as YYYY-MM-DD
function getCurrentWeekStart() {
  const d = new Date();
  const day = d.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  d.setDate(d.getDate() + diff);
  return d.toISOString().split("T")[0];
}

module.exports = router;
