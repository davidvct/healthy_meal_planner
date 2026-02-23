const express = require("express");
const router = express.Router();
const { getDb } = require("../db");
const { getDayNutrients, getWeekNutrients, NUTRIENT_KEYS, RDA } = require("../services/nutrientCalculator");
const { getEntryWarnings, CONDITION_RULES } = require("../services/recommendationEngine");

// GET /api/mealplan/:userId?weekStart=YYYY-MM-DD — retrieve the weekly meal plan for a specific week
router.get("/:userId", (req, res) => {
  const db = getDb();
  const weekStart = req.query.weekStart || getCurrentWeekStart();

  const entries = db.prepare(`
    SELECT mp.*, d.name as dish_name, d.ingredients as dish_ingredients, d.tags, d.meal_types, d.recipe_id
    FROM meal_plans mp
    JOIN dishes d ON d.id = mp.dish_id
    WHERE mp.user_id = ? AND mp.week_start = ?
    ORDER BY mp.day_index, mp.meal_type, mp.entry_order
  `).all(req.params.userId, weekStart);

  // Group into the structure frontend expects: { [dayIndex]: { [mealType]: [...entries] } }
  const plan = {};
  for (let i = 0; i < 7; i++) plan[i] = {};

  for (const entry of entries) {
    if (!plan[entry.day_index][entry.meal_type]) {
      plan[entry.day_index][entry.meal_type] = [];
    }
    plan[entry.day_index][entry.meal_type].push({
      id: entry.id,
      dishId: entry.dish_id,
      dishName: entry.dish_name,
      servings: entry.servings,
      customIngredients: entry.custom_ingredients ? JSON.parse(entry.custom_ingredients) : null,
      dishIngredients: JSON.parse(entry.dish_ingredients),
      tags: JSON.parse(entry.tags),
      mealTypes: JSON.parse(entry.meal_types),
      recipeId: entry.recipe_id,
    });
  }

  res.json(plan);
});

// POST /api/mealplan/:userId/add — add a dish to a meal slot
router.post("/:userId/add", (req, res) => {
  const db = getDb();
  const { dayIndex, mealType, dishId, servings = 1, customIngredients = null, weekStart } = req.body;
  const ws = weekStart || getCurrentWeekStart();

  // Get current max entry_order for this slot
  const maxOrder = db.prepare(`
    SELECT COALESCE(MAX(entry_order), -1) as m
    FROM meal_plans
    WHERE user_id = ? AND week_start = ? AND day_index = ? AND meal_type = ?
  `).get(req.params.userId, ws, dayIndex, mealType);

  db.prepare(`
    INSERT INTO meal_plans (user_id, week_start, day_index, meal_type, dish_id, servings, custom_ingredients, entry_order)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    req.params.userId,
    ws,
    dayIndex,
    mealType,
    dishId,
    servings,
    customIngredients ? JSON.stringify(customIngredients) : null,
    maxOrder.m + 1
  );

  res.json({ success: true });
});

// DELETE /api/mealplan/:userId/remove/:entryId — remove a specific entry
router.delete("/:userId/remove/:entryId", (req, res) => {
  const db = getDb();
  db.prepare("DELETE FROM meal_plans WHERE id = ? AND user_id = ?")
    .run(req.params.entryId, req.params.userId);
  res.json({ success: true });
});

// GET /api/mealplan/:userId/nutrients/week?weekStart=YYYY-MM-DD — weekly nutrient summary
router.get("/:userId/nutrients/week", (req, res) => {
  const db = getDb();
  const weekStart = req.query.weekStart || getCurrentWeekStart();

  const user = db.prepare("SELECT * FROM users WHERE id = ?").get(req.params.userId);
  const conditions = user ? JSON.parse(user.conditions) : [];

  const entries = db.prepare(`
    SELECT mp.*, d.ingredients
    FROM meal_plans mp
    JOIN dishes d ON d.id = mp.dish_id
    WHERE mp.user_id = ? AND mp.week_start = ?
    ORDER BY mp.day_index
  `).all(req.params.userId, weekStart);

  const weekN = getWeekNutrients(entries);
  const weekRDA = {};
  NUTRIENT_KEYS.forEach(k => weekRDA[k] = RDA[k] * 7);

  // Daily breakdown
  const daily = [];
  for (let d = 0; d < 7; d++) {
    const dayEntries = entries.filter(e => e.day_index === d);
    const dayN = getDayNutrients(dayEntries);
    const hasMeals = dayEntries.length > 0;

    const warnings = [];
    for (const c of conditions) {
      const rule = CONDITION_RULES[c];
      if (!rule) continue;
      for (const [nutrient, limit] of Object.entries(rule.limit)) {
        if (dayN[nutrient] > limit * 3) warnings.push(`${rule.warnLabel} for the day`);
      }
    }

    daily.push({ dayIndex: d, nutrients: dayN, hasMeals, warnings: [...new Set(warnings)] });
  }

  res.json({ weekNutrients: weekN, weekRDA, daily });
});

// GET /api/mealplan/:userId/nutrients/day/:dayIndex?weekStart=YYYY-MM-DD — single day nutrients
router.get("/:userId/nutrients/day/:dayIndex", (req, res) => {
  const db = getDb();
  const dayIndex = parseInt(req.params.dayIndex);
  const weekStart = req.query.weekStart || getCurrentWeekStart();

  const entries = db.prepare(`
    SELECT mp.*, d.ingredients
    FROM meal_plans mp
    JOIN dishes d ON d.id = mp.dish_id
    WHERE mp.user_id = ? AND mp.week_start = ? AND mp.day_index = ?
  `).all(req.params.userId, weekStart, dayIndex);

  const dayNutrients = getDayNutrients(entries);
  res.json(dayNutrients);
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
