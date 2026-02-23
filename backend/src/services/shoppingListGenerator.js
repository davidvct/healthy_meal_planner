const { getDb } = require("../db");

function getShoppingList(userId, weekStart) {
  const db = getDb();
  const ws = weekStart || getCurrentWeekStart();

  const entries = db.prepare(`
    SELECT mp.servings, mp.custom_ingredients, d.ingredients
    FROM meal_plans mp
    JOIN dishes d ON d.id = mp.dish_id
    WHERE mp.user_id = ? AND mp.week_start = ?
  `).all(userId, ws);

  const list = {};

  for (const entry of entries) {
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

module.exports = { getShoppingList };
