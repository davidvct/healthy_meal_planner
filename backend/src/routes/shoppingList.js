const express = require("express");
const router = express.Router();
const { getShoppingList, isSlotExpired } = require("../services/shoppingListGenerator");
const { getDb } = require("../db");

// GET /api/shopping-list/:userId?weekStart=YYYY-MM-DD
// Returns aggregated shopping list based on saved selections (auto-removes expired)
router.get("/:userId", (req, res) => {
  const db = getDb();
  const { userId } = req.params;
  const weekStart = req.query.weekStart;

  // Fetch saved selections
  const selectionsQuery = weekStart
    ? db.prepare("SELECT day_index, meal_type FROM shopping_selections WHERE user_id = ? AND week_start = ?")
    : db.prepare("SELECT day_index, meal_type FROM shopping_selections WHERE user_id = ?");
  const rawSelections = weekStart
    ? selectionsQuery.all(userId, weekStart)
    : selectionsQuery.all(userId);

  // Filter out expired slots and clean up DB
  const expiredKeys = [];
  const validSelections = [];
  for (const s of rawSelections) {
    if (weekStart && isSlotExpired(weekStart, s.day_index, s.meal_type)) {
      expiredKeys.push(s);
    } else {
      validSelections.push({ dayIndex: s.day_index, mealType: s.meal_type });
    }
  }

  // Remove expired selections from DB
  if (expiredKeys.length > 0 && weekStart) {
    const deleteStmt = db.prepare(
      "DELETE FROM shopping_selections WHERE user_id = ? AND week_start = ? AND day_index = ? AND meal_type = ?"
    );
    const deleteExpired = db.transaction(() => {
      for (const s of expiredKeys) {
        deleteStmt.run(userId, weekStart, s.day_index, s.meal_type);
      }
    });
    deleteExpired();
  }

  // Count total planned dishes for selected slots
  let totalDishes = 0;
  if (validSelections.length > 0 && weekStart) {
    for (const s of validSelections) {
      const count = db.prepare(
        "SELECT COUNT(*) as c FROM meal_plans WHERE user_id = ? AND week_start = ? AND day_index = ? AND meal_type = ?"
      ).get(userId, weekStart, s.dayIndex, s.mealType);
      totalDishes += count.c;
    }
  }

  const items = getShoppingList(userId, weekStart, validSelections);

  res.json({
    totalDishes,
    items,
    selections: validSelections,
  });
});

// POST /api/shopping-list/:userId/toggle-selection
// Toggle a single meal slot selection. Returns updated selections.
router.post("/:userId/toggle-selection", (req, res) => {
  const db = getDb();
  const { userId } = req.params;
  const { weekStart, dayIndex, mealType } = req.body;

  if (!weekStart || dayIndex === undefined || !mealType) {
    return res.status(400).json({ error: "weekStart, dayIndex, and mealType are required" });
  }

  // Check if already selected
  const existing = db.prepare(
    "SELECT id FROM shopping_selections WHERE user_id = ? AND week_start = ? AND day_index = ? AND meal_type = ?"
  ).get(userId, weekStart, dayIndex, mealType);

  if (existing) {
    // Deselect
    db.prepare("DELETE FROM shopping_selections WHERE id = ?").run(existing.id);
  } else {
    // Select
    db.prepare(
      "INSERT INTO shopping_selections (user_id, week_start, day_index, meal_type) VALUES (?, ?, ?, ?)"
    ).run(userId, weekStart, dayIndex, mealType);
  }

  // Return updated valid selections
  const rawSelections = db.prepare(
    "SELECT day_index, meal_type FROM shopping_selections WHERE user_id = ? AND week_start = ?"
  ).all(userId, weekStart);

  const selections = rawSelections
    .filter(s => !isSlotExpired(weekStart, s.day_index, s.meal_type))
    .map(s => ({ dayIndex: s.day_index, mealType: s.meal_type }));

  res.json({ selections });
});

module.exports = router;
