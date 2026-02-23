const express = require("express");
const router = express.Router();
const { getShoppingList } = require("../services/shoppingListGenerator");
const { getDb } = require("../db");

// GET /api/shopping-list/:userId?weekStart=YYYY-MM-DD — aggregated weekly shopping list
router.get("/:userId", (req, res) => {
  const db = getDb();
  const weekStart = req.query.weekStart;

  // Count total planned dishes for this week
  const countQuery = weekStart
    ? db.prepare("SELECT COUNT(*) as c FROM meal_plans WHERE user_id = ? AND week_start = ?")
    : db.prepare("SELECT COUNT(*) as c FROM meal_plans WHERE user_id = ?");
  const countResult = weekStart
    ? countQuery.get(req.params.userId, weekStart)
    : countQuery.get(req.params.userId);

  const items = getShoppingList(req.params.userId, weekStart);

  res.json({
    totalDishes: countResult.c,
    items,
  });
});

module.exports = router;
