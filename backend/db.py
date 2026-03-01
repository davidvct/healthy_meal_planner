from __future__ import annotations

import json
import sqlite3
from pathlib import Path
from typing import Iterator

from .data import load_seed_data

DB_PATH = Path(__file__).resolve().parent / "mealwise.db"


def _connect() -> sqlite3.Connection:
    conn = sqlite3.connect(DB_PATH, check_same_thread=False)
    conn.row_factory = sqlite3.Row
    conn.execute("PRAGMA journal_mode = WAL")
    conn.execute("PRAGMA foreign_keys = ON")
    return conn


def get_db() -> Iterator[sqlite3.Connection]:
    conn = _connect()
    try:
        yield conn
    finally:
        conn.close()


def init_db() -> None:
    conn = _connect()
    try:
        _init_schema(conn)
        _migrate_schema(conn)
        _seed_from_dataset(conn)
        conn.commit()
    finally:
        conn.close()


def _init_schema(conn: sqlite3.Connection) -> None:
    conn.executescript(
        """
        CREATE TABLE IF NOT EXISTS meta (
          key TEXT PRIMARY KEY,
          value TEXT NOT NULL
        );

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
          base_servings INTEGER NOT NULL DEFAULT 1,
          description TEXT,
          source_url TEXT,
          image_url TEXT,
          calories REAL NOT NULL DEFAULT 0,
          protein REAL NOT NULL DEFAULT 0,
          carbs REAL NOT NULL DEFAULT 0,
          fat REAL NOT NULL DEFAULT 0,
          fiber REAL NOT NULL DEFAULT 0,
          sodium REAL NOT NULL DEFAULT 0,
          cholesterol REAL NOT NULL DEFAULT 0,
          sugar REAL NOT NULL DEFAULT 0,
          allergies TEXT NOT NULL DEFAULT '[]',
          diet_label TEXT NOT NULL DEFAULT 'none',
          hypertension_category TEXT,
          diabetes_category TEXT,
          cholesterol_category TEXT
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
          auth_user_id TEXT UNIQUE,
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
          recommended_calories REAL,
          recommended_protein REAL,
          recommended_carbs REAL,
          recommended_fat REAL,
          created_at TEXT NOT NULL DEFAULT (datetime('now')),
          FOREIGN KEY (caretaker_id) REFERENCES caretakers(id)
        );

        CREATE TABLE IF NOT EXISTS auth_users (
          id TEXT PRIMARY KEY,
          email TEXT NOT NULL UNIQUE,
          password_hash TEXT NOT NULL,
          email_verified_at TEXT NOT NULL,
          created_at TEXT NOT NULL DEFAULT (datetime('now'))
        );

        CREATE TABLE IF NOT EXISTS email_otps (
          email TEXT PRIMARY KEY,
          otp_code TEXT NOT NULL,
          expires_at TEXT NOT NULL,
          verified_at TEXT,
          verification_token TEXT,
          consumed_at TEXT,
          created_at TEXT NOT NULL DEFAULT (datetime('now'))
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
        """
    )


def _has_column(conn: sqlite3.Connection, table: str, column: str) -> bool:
    rows = conn.execute(f"PRAGMA table_info({table})").fetchall()
    return any(row["name"] == column for row in rows)


def _add_column_if_missing(conn: sqlite3.Connection, table: str, column: str, ddl_type: str) -> None:
    if not _has_column(conn, table, column):
        conn.execute(f"ALTER TABLE {table} ADD COLUMN {column} {ddl_type}")


def _migrate_schema(conn: sqlite3.Connection) -> None:
    # Backwards compatibility for earlier database versions.
    _add_column_if_missing(conn, "meal_plans", "week_start", "TEXT NOT NULL DEFAULT '2026-02-23'")
    conn.execute("DROP INDEX IF EXISTS idx_meal_plans_user")
    conn.execute(
        "CREATE INDEX IF NOT EXISTS idx_meal_plans_user "
        "ON meal_plans(user_id, week_start, day_index, meal_type)"
    )

    _add_column_if_missing(conn, "users", "name", "TEXT NOT NULL DEFAULT 'Diner'")
    _add_column_if_missing(conn, "users", "age", "INTEGER")
    _add_column_if_missing(conn, "users", "sex", "TEXT")
    _add_column_if_missing(conn, "users", "weight_kg", "REAL")
    _add_column_if_missing(conn, "users", "caretaker_id", "TEXT REFERENCES caretakers(id)")
    _add_column_if_missing(conn, "users", "recommended_calories", "REAL")
    _add_column_if_missing(conn, "users", "recommended_protein", "REAL")
    _add_column_if_missing(conn, "users", "recommended_carbs", "REAL")
    _add_column_if_missing(conn, "users", "recommended_fat", "REAL")
    _add_column_if_missing(conn, "caretakers", "auth_user_id", "TEXT")
    conn.execute("CREATE UNIQUE INDEX IF NOT EXISTS idx_caretakers_auth_user_id ON caretakers(auth_user_id)")

    _add_column_if_missing(conn, "dishes", "description", "TEXT")
    _add_column_if_missing(conn, "dishes", "source_url", "TEXT")
    _add_column_if_missing(conn, "dishes", "image_url", "TEXT")
    _add_column_if_missing(conn, "dishes", "calories", "REAL NOT NULL DEFAULT 0")
    _add_column_if_missing(conn, "dishes", "protein", "REAL NOT NULL DEFAULT 0")
    _add_column_if_missing(conn, "dishes", "carbs", "REAL NOT NULL DEFAULT 0")
    _add_column_if_missing(conn, "dishes", "fat", "REAL NOT NULL DEFAULT 0")
    _add_column_if_missing(conn, "dishes", "fiber", "REAL NOT NULL DEFAULT 0")
    _add_column_if_missing(conn, "dishes", "sodium", "REAL NOT NULL DEFAULT 0")
    _add_column_if_missing(conn, "dishes", "cholesterol", "REAL NOT NULL DEFAULT 0")
    _add_column_if_missing(conn, "dishes", "sugar", "REAL NOT NULL DEFAULT 0")
    _add_column_if_missing(conn, "dishes", "allergies", "TEXT NOT NULL DEFAULT '[]'")
    _add_column_if_missing(conn, "dishes", "diet_label", "TEXT NOT NULL DEFAULT 'none'")
    _add_column_if_missing(conn, "dishes", "hypertension_category", "TEXT")
    _add_column_if_missing(conn, "dishes", "diabetes_category", "TEXT")
    _add_column_if_missing(conn, "dishes", "cholesterol_category", "TEXT")


def _read_meta(conn: sqlite3.Connection, key: str) -> str | None:
    row = conn.execute("SELECT value FROM meta WHERE key = ?", (key,)).fetchone()
    return row["value"] if row else None


def _write_meta(conn: sqlite3.Connection, key: str, value: str) -> None:
    conn.execute(
        """
        INSERT INTO meta (key, value)
        VALUES (?, ?)
        ON CONFLICT(key) DO UPDATE SET value = excluded.value
        """,
        (key, value),
    )


def _seed_from_dataset(conn: sqlite3.Connection) -> None:
    seed_data = load_seed_data()
    data_version = seed_data["version"]

    existing_version = _read_meta(conn, "dataset_version")
    dishes_count_row = conn.execute("SELECT COUNT(*) AS c FROM dishes").fetchone()
    dishes_count = dishes_count_row["c"] if dishes_count_row else 0

    # Re-seed when data is missing, stale, or still the old tiny seed set.
    needs_seed = (
        dishes_count == 0
        or dishes_count < 100
        or existing_version != data_version
    )

    if not needs_seed:
        return

    conn.execute("DELETE FROM shopping_selections")
    conn.execute("DELETE FROM meal_plans")
    conn.execute("DELETE FROM dishes")
    conn.execute("DELETE FROM recipes")
    conn.execute("DELETE FROM ingredients")

    conn.executemany(
        """
        INSERT INTO ingredients (
            id, calories, protein_g, carbs_g, fat_g, fiber_g, sodium_mg, cholesterol_mg, sugar_g
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        """,
        [(name, *vals) for name, vals in seed_data["ingredients"].items()],
    )

    conn.executemany(
        """
        INSERT INTO dishes (
            id, name, meal_types, tags, ingredients, recipe_id, base_servings,
            description, source_url, image_url,
            calories, protein, carbs, fat, fiber, sodium, cholesterol, sugar,
            allergies, diet_label, hypertension_category, diabetes_category, cholesterol_category
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """,
        [
            (
                d["id"],
                d["name"],
                json.dumps(d["mealTypes"]),
                json.dumps(d["tags"]),
                json.dumps(d["ingredients"]),
                d["recipeId"],
                d["baseServings"],
                d["description"],
                d["sourceUrl"],
                d["imageUrl"],
                d["calories"],
                d["protein"],
                d["carbs"],
                d["fat"],
                d["fiber"],
                d["sodium"],
                d["cholesterol"],
                d["sugar"],
                json.dumps(d["allergies"]),
                d["dietLabel"],
                d["hypertensionCategory"],
                d["diabetesCategory"],
                d["cholesterolCategory"],
            )
            for d in seed_data["dishes"]
        ],
    )

    conn.executemany(
        """
        INSERT INTO recipes (id, name, prep_time, cook_time, steps)
        VALUES (?, ?, ?, ?, ?)
        """,
        [
            (recipe_id, r["name"], r["prepTime"], r["cookTime"], json.dumps(r["steps"]))
            for recipe_id, r in seed_data["recipes"].items()
        ],
    )

    _write_meta(conn, "dataset_version", data_version)
