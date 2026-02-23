const express = require("express");
const router = express.Router();
const { getShoppingList } = require("../services/shoppingListGenerator");
const { getDb } = require("../db");

// GET /api/shopping-list/:userId — aggregated weekly shopping list
router.get("/:userId", (req, res) => {
  const db = getDb();

  // Count total planned dishes
  const countResult = db.prepare(
    "SELECT COUNT(*) as c FROM meal_plans WHERE user_id = ?"
  ).get(req.params.userId);

  const items = getShoppingList(req.params.userId);

  res.json({
    totalDishes: countResult.c,
    items,
  });
});

module.exports = router;
