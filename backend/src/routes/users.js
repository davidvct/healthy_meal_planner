const express = require("express");
const router = express.Router();
const crypto = require("crypto");
const { getDb } = require("../db");

// POST /api/users/profile — create or update user profile
router.post("/profile", (req, res) => {
  const db = getDb();
  const { userId, conditions = [], diet = "none", allergies = [] } = req.body;

  // Generate a user ID if not provided (new user)
  const id = userId || crypto.randomUUID();

  db.prepare(`
    INSERT INTO users (id, conditions, diet, allergies)
    VALUES (?, ?, ?, ?)
    ON CONFLICT(id) DO UPDATE SET
      conditions = excluded.conditions,
      diet = excluded.diet,
      allergies = excluded.allergies
  `).run(id, JSON.stringify(conditions), diet, JSON.stringify(allergies));

  res.json({
    userId: id,
    conditions,
    diet,
    allergies,
  });
});

// GET /api/users/:id — get user profile
router.get("/:id", (req, res) => {
  const db = getDb();
  const user = db.prepare("SELECT * FROM users WHERE id = ?").get(req.params.id);

  if (!user) return res.status(404).json({ error: "User not found" });

  res.json({
    userId: user.id,
    conditions: JSON.parse(user.conditions),
    diet: user.diet,
    allergies: JSON.parse(user.allergies),
  });
});

// DELETE /api/users/:id — delete user and their meal plans
router.delete("/:id", (req, res) => {
  const db = getDb();
  db.prepare("DELETE FROM meal_plans WHERE user_id = ?").run(req.params.id);
  db.prepare("DELETE FROM users WHERE id = ?").run(req.params.id);
  res.json({ success: true });
});

module.exports = router;
