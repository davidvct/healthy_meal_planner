const { getDb } = require("../db");

function getShoppingList(userId) {
  const db = getDb();

  const entries = db.prepare(`
    SELECT mp.servings, mp.custom_ingredients, d.ingredients
    FROM meal_plans mp
    JOIN dishes d ON d.id = mp.dish_id
    WHERE mp.user_id = ?
  `).all(userId);

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

module.exports = { getShoppingList };
