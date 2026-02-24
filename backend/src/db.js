const Database = require("better-sqlite3");
const path = require("path");
const { INGREDIENTS_NUTRIENTS } = require("./data/ingredients");
const { DISHES } = require("./data/dishes");
const { RECIPES } = require("./data/recipes");
const { NUTRIENT_KEYS } = require("../../shared/nutrientKeys");

const DB_PATH = path.join(__dirname, "..", "mealwise.db");

let db;

function getDb() {
  if (db) return db;
  db = new Database(DB_PATH);
  db.pragma("journal_mode = WAL");
  db.pragma("foreign_keys = ON");
  initSchema();
  migrateSchema();
  seedIfEmpty();
  return db;
}

function initSchema() {
  db.exec(`
    CREATE TABLE IF NOT EXISTS ingredients (
      id TEXT PRIMARY KEY,
      calories REAL NOT NULL,
      protein_g REAL NOT NULL,
      carbs_g REAL NOT NULL,
      fat_g REAL NOT NULL,
      fiber_g REAL NOT NULL,
      sodium_mg REAL NOT NULL,
      cholesterol_mg REAL NOT NULL,
      sugar_g REAL NOT NULL
    );

    CREATE TABLE IF NOT EXISTS dishes (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      meal_types TEXT NOT NULL,
      tags TEXT NOT NULL,
      ingredients TEXT NOT NULL,
      recipe_id TEXT,
      base_servings INTEGER NOT NULL DEFAULT 1
    );

    CREATE TABLE IF NOT EXISTS recipes (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      prep_time INTEGER NOT NULL,
      cook_time INTEGER NOT NULL,
      steps TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS caretakers (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL DEFAULT 'Diner',
      age INTEGER,
      sex TEXT,
      weight_kg REAL,
      caretaker_id TEXT,
      conditions TEXT NOT NULL DEFAULT '[]',
      diet TEXT NOT NULL DEFAULT 'none',
      allergies TEXT NOT NULL DEFAULT '[]',
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      FOREIGN KEY (caretaker_id) REFERENCES caretakers(id)
    );

    CREATE TABLE IF NOT EXISTS meal_plans (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id TEXT NOT NULL,
      week_start TEXT NOT NULL DEFAULT '2026-02-23',
      day_index INTEGER NOT NULL,
      meal_type TEXT NOT NULL,
      dish_id TEXT NOT NULL,
      servings REAL NOT NULL DEFAULT 1,
      custom_ingredients TEXT,
      entry_order INTEGER NOT NULL DEFAULT 0,
      FOREIGN KEY (user_id) REFERENCES users(id),
      FOREIGN KEY (dish_id) REFERENCES dishes(id)
    );

    CREATE INDEX IF NOT EXISTS idx_meal_plans_user
      ON meal_plans(user_id, week_start, day_index, meal_type);

    CREATE TABLE IF NOT EXISTS shopping_selections (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id TEXT NOT NULL,
      week_start TEXT NOT NULL,
      day_index INTEGER NOT NULL,
      meal_type TEXT NOT NULL,
      UNIQUE(user_id, week_start, day_index, meal_type),
      FOREIGN KEY (user_id) REFERENCES users(id)
    );
  `);
}

function migrateSchema() {
  // Add week_start column if it doesn't exist (for existing DBs)
  const mealCols = db.prepare("PRAGMA table_info(meal_plans)").all();
  if (!mealCols.find(c => c.name === "week_start")) {
    db.exec("ALTER TABLE meal_plans ADD COLUMN week_start TEXT NOT NULL DEFAULT '2026-02-23'");
    db.exec("DROP INDEX IF EXISTS idx_meal_plans_user");
    db.exec("CREATE INDEX IF NOT EXISTS idx_meal_plans_user ON meal_plans(user_id, week_start, day_index, meal_type)");
    console.log("[MealWise] Migrated meal_plans: added week_start column.");
  }

  // Add caretaker/diner columns if they don't exist (for existing DBs)
  const userCols = db.prepare("PRAGMA table_info(users)").all();
  if (!userCols.find(c => c.name === "name")) {
    db.exec("ALTER TABLE users ADD COLUMN name TEXT NOT NULL DEFAULT 'Diner'");
    db.exec("ALTER TABLE users ADD COLUMN age INTEGER");
    db.exec("ALTER TABLE users ADD COLUMN sex TEXT");
    db.exec("ALTER TABLE users ADD COLUMN weight_kg REAL");
    db.exec("ALTER TABLE users ADD COLUMN caretaker_id TEXT REFERENCES caretakers(id)");
    console.log("[MealWise] Migrated users: added diner profile columns.");
  }
}

function seedIfEmpty() {
  const count = db.prepare("SELECT COUNT(*) as c FROM ingredients").get();
  if (count.c > 0) return;

  console.log("[MealWise] Seeding database...");

  // Seed ingredients
  const insertIngredient = db.prepare(`
    INSERT INTO ingredients (id, calories, protein_g, carbs_g, fat_g, fiber_g, sodium_mg, cholesterol_mg, sugar_g)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);
  const seedIngredients = db.transaction(() => {
    for (const [name, nutrients] of Object.entries(INGREDIENTS_NUTRIENTS)) {
      insertIngredient.run(name, ...nutrients);
    }
  });
  seedIngredients();

  // Seed dishes
  const insertDish = db.prepare(`
    INSERT INTO dishes (id, name, meal_types, tags, ingredients, recipe_id, base_servings)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `);
  const seedDishes = db.transaction(() => {
    for (const d of DISHES) {
      insertDish.run(
        d.id,
        d.name,
        JSON.stringify(d.mealTypes),
        JSON.stringify(d.tags),
        JSON.stringify(d.ingredients),
        d.recipeId,
        d.baseServings
      );
    }
  });
  seedDishes();

  // Seed recipes
  const insertRecipe = db.prepare(`
    INSERT INTO recipes (id, name, prep_time, cook_time, steps)
    VALUES (?, ?, ?, ?, ?)
  `);
  const seedRecipes = db.transaction(() => {
    for (const [id, r] of Object.entries(RECIPES)) {
      insertRecipe.run(id, r.name, r.prepTime, r.cookTime, JSON.stringify(r.steps));
    }
  });
  seedRecipes();

  console.log("[MealWise] Seeding complete.");
}

module.exports = { getDb };
