const express = require("express");
const router = express.Router();
const crypto = require("crypto");
const { getDb } = require("../db");

// POST /api/caretakers — create a new caretaker
router.post("/", (req, res) => {
  const db = getDb();
  const { name } = req.body;

  if (!name || !name.trim()) {
    return res.status(400).json({ error: "Name is required" });
  }

  const id = crypto.randomUUID();
  db.prepare("INSERT INTO caretakers (id, name) VALUES (?, ?)").run(id, name.trim());

  res.json({ caretakerId: id, name: name.trim() });
});

// GET /api/caretakers/:id — get caretaker info
router.get("/:id", (req, res) => {
  const db = getDb();
  const caretaker = db.prepare("SELECT * FROM caretakers WHERE id = ?").get(req.params.id);

  if (!caretaker) return res.status(404).json({ error: "Caretaker not found" });

  res.json({ caretakerId: caretaker.id, name: caretaker.name });
});

// GET /api/caretakers/:id/diners — list all diners for a caretaker
router.get("/:id/diners", (req, res) => {
  const db = getDb();
  const diners = db.prepare("SELECT * FROM users WHERE caretaker_id = ? ORDER BY created_at ASC").all(req.params.id);

  res.json(diners.map(u => ({
    userId: u.id,
    name: u.name,
    age: u.age,
    sex: u.sex,
    weightKg: u.weight_kg,
    conditions: JSON.parse(u.conditions),
    diet: u.diet,
    allergies: JSON.parse(u.allergies),
  })));
});

module.exports = router;
