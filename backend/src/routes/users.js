const express = require("express");
const router = express.Router();
const crypto = require("crypto");
const { getDb } = require("../db");

// POST /api/users/profile — create or update diner profile
router.post("/profile", (req, res) => {
  const db = getDb();
  const {
    userId,
    name = "Diner",
    age = null,
    sex = null,
    weightKg = null,
    caretakerId = null,
    conditions = [],
    diet = "none",
    allergies = [],
  } = req.body;

  const id = userId || crypto.randomUUID();

  db.prepare(`
    INSERT INTO users (id, name, age, sex, weight_kg, caretaker_id, conditions, diet, allergies)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    ON CONFLICT(id) DO UPDATE SET
      name = excluded.name,
      age = excluded.age,
      sex = excluded.sex,
      weight_kg = excluded.weight_kg,
      caretaker_id = excluded.caretaker_id,
      conditions = excluded.conditions,
      diet = excluded.diet,
      allergies = excluded.allergies
  `).run(id, name, age, sex, weightKg, caretakerId, JSON.stringify(conditions), diet, JSON.stringify(allergies));

  res.json({
    userId: id,
    name,
    age,
    sex,
    weightKg,
    caretakerId,
    conditions,
    diet,
    allergies,
  });
});

// GET /api/users/:id — get diner profile
router.get("/:id", (req, res) => {
  const db = getDb();
  const user = db.prepare("SELECT * FROM users WHERE id = ?").get(req.params.id);

  if (!user) return res.status(404).json({ error: "User not found" });

  res.json({
    userId: user.id,
    name: user.name,
    age: user.age,
    sex: user.sex,
    weightKg: user.weight_kg,
    caretakerId: user.caretaker_id,
    conditions: JSON.parse(user.conditions),
    diet: user.diet,
    allergies: JSON.parse(user.allergies),
  });
});

// DELETE /api/users/:id — delete diner and their meal plans
router.delete("/:id", (req, res) => {
  const db = getDb();
  db.prepare("DELETE FROM meal_plans WHERE user_id = ?").run(req.params.id);
  db.prepare("DELETE FROM users WHERE id = ?").run(req.params.id);
  res.json({ success: true });
});

module.exports = router;
