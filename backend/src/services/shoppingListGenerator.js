const { getDb } = require("../db");

// Meal cutoff hours (same as frontend)
const MEAL_CUTOFF = { breakfast: 10, lunch: 14, dinner: 20 };

/**
 * Check if a meal slot is in the past based on weekStart, dayIndex, mealType.
 */
function isSlotExpired(weekStart, dayIndex, mealType) {
  const now = new Date();
  const monday = new Date(weekStart + "T00:00:00");
  const slotDate = new Date(monday);
  slotDate.setDate(monday.getDate() + dayIndex);
  slotDate.setHours(0, 0, 0, 0);

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  if (slotDate < today) return true;
  if (slotDate.getTime() === today.getTime()) {
    const cutoff = MEAL_CUTOFF[mealType];
    if (cutoff && now.getHours() >= cutoff) return true;
  }
  return false;
}

/**
 * Get aggregated shopping list filtered by selections.
 * @param {string} userId
 * @param {string} weekStart - YYYY-MM-DD
 * @param {Array<{dayIndex: number, mealType: string}>|null} selections - if null, returns empty list
 */
function getShoppingList(userId, weekStart, selections) {
  const db = getDb();
  const ws = weekStart || getCurrentWeekStart();

  // If no selections provided, return empty
  if (!selections || selections.length === 0) {
    return [];
  }

  // Build filter for selected slots
  const entries = db.prepare(`
    SELECT mp.day_index, mp.meal_type, mp.servings, mp.custom_ingredients, d.ingredients
    FROM meal_plans mp
    JOIN dishes d ON d.id = mp.dish_id
    WHERE mp.user_id = ? AND mp.week_start = ?
  `).all(userId, ws);

  // Create a set of selected slot keys for fast lookup
  const selectedKeys = new Set(
    selections.map(s => `${s.dayIndex}-${s.mealType}`)
  );

  const list = {};

  for (const entry of entries) {
    const key = `${entry.day_index}-${entry.meal_type}`;
    if (!selectedKeys.has(key)) continue;

    const dishIngredients = JSON.parse(entry.ingredients);
    const customIngs = entry.custom_ingredients ? JSON.parse(entry.custom_ingredients) : null;

    const ings = customIngs || Object.fromEntries(
      Object.entries(dishIngredients).map(([k, v]) => [k, v * entry.servings])
    );

    for (const [ing, amount] of Object.entries(ings)) {
      list[ing] = (list[ing] || 0) + amount;
    }
  }

  return Object.entries(list)
    .sort((a, b) => a[0].localeCompare(b[0]))
    .map(([name, grams]) => ({ name, grams: Math.round(grams) }));
}

function getCurrentWeekStart() {
  const d = new Date();
  const day = d.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  d.setDate(d.getDate() + diff);
  return d.toISOString().split("T")[0];
}

module.exports = { getShoppingList, isSlotExpired };
