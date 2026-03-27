from __future__ import annotations

import json
from typing import Any, Iterator

from .config import get_setting
from .data import load_seed_data

DATABASE_URL = get_setting("DATABASE_URL", "") or ""


class DBConnection:
    backend = "postgres"

    def __init__(self, conn: Any):
        self._conn = conn

    @staticmethod
    def _adapt_sql(sql: str) -> str:
        return sql.replace("?", "%s")

    def execute(self, sql: str, params: tuple[Any, ...] | list[Any] = ()):
        cur = self._conn.cursor()
        cur.execute(self._adapt_sql(sql), tuple(params))
        return cur

    def executemany(self, sql: str, seq_params: list[tuple[Any, ...]]):
        cur = self._conn.cursor()
        cur.executemany(self._adapt_sql(sql), seq_params)
        return cur

    def commit(self) -> None:
        self._conn.commit()

    def close(self) -> None:
        self._conn.close()


def _connect() -> DBConnection:
    db_url = DATABASE_URL
    if not db_url:
        raise RuntimeError("DATABASE_URL is required and must point to PostgreSQL/Cloud SQL")
    if not (db_url.startswith("postgres://") or db_url.startswith("postgresql://")):
        raise RuntimeError("DATABASE_URL must be a PostgreSQL URL (postgresql://...)")

    try:
        import psycopg
        from psycopg.rows import dict_row
    except Exception as exc:  # pragma: no cover
        raise RuntimeError(
            "PostgreSQL DATABASE_URL detected but psycopg is not installed. "
            "Install dependency: psycopg[binary]"
        ) from exc

    conn = psycopg.connect(db_url, row_factory=dict_row)
    return DBConnection(conn)


def get_db() -> Iterator[DBConnection]:
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
        _backfill_recipe_nutrients(conn)
        _backfill_recipe_ingredients(conn)
        _backfill_recipe_ingredients_raw(conn)
        _backfill_recipe_diet_flags(conn)
        _backfill_strip_ingredient_bullets(conn)
        _backfill_health_categories(conn)
        _backfill_recipe_category(conn)
        _backfill_recipe_allergies(conn)
        _backfill_recipe_image_url(conn)
        conn.commit()
    finally:
        conn.close()


def _executescript(conn: DBConnection, script: str) -> None:
    for statement in script.split(";"):
        stmt = statement.strip()
        if stmt:
            conn.execute(stmt)


def _init_schema(conn: DBConnection) -> None:
    _executescript(
        conn,
        """
        CREATE TABLE IF NOT EXISTS meta (
          key TEXT PRIMARY KEY,
          value TEXT NOT NULL
        );

        CREATE TABLE IF NOT EXISTS ingredients (
          id TEXT PRIMARY KEY,
          calories DOUBLE PRECISION NOT NULL,
          protein_g DOUBLE PRECISION NOT NULL,
          carbs_g DOUBLE PRECISION NOT NULL,
          fat_g DOUBLE PRECISION NOT NULL,
          fiber_g DOUBLE PRECISION NOT NULL,
          sodium_mg DOUBLE PRECISION NOT NULL,
          cholesterol_mg DOUBLE PRECISION NOT NULL,
          sugar_g DOUBLE PRECISION NOT NULL
        );

        CREATE TABLE IF NOT EXISTS recipes (
          id TEXT PRIMARY KEY,
          name TEXT NOT NULL,
          prep_time INTEGER NOT NULL,
          cook_time INTEGER NOT NULL,
          steps TEXT NOT NULL DEFAULT '[]'
        );

        CREATE TABLE IF NOT EXISTS caretakers (
          id TEXT PRIMARY KEY,
          name TEXT NOT NULL,
          auth_user_id TEXT UNIQUE,
          created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
        );

        CREATE TABLE IF NOT EXISTS users (
          id TEXT PRIMARY KEY,
          email TEXT UNIQUE,
          password_hash TEXT,
          email_verified_at TIMESTAMPTZ,
          name TEXT NOT NULL DEFAULT 'Diner',
          age INTEGER,
          sex TEXT,
          weight_kg DOUBLE PRECISION,
          caretaker_id TEXT,
          conditions TEXT NOT NULL DEFAULT '[]',
          diet TEXT NOT NULL DEFAULT 'none',
          allergies TEXT NOT NULL DEFAULT '[]',
          recommended_calories DOUBLE PRECISION,
          recommended_protein DOUBLE PRECISION,
          recommended_carbs DOUBLE PRECISION,
          recommended_fat DOUBLE PRECISION,
          created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
        );

        CREATE TABLE IF NOT EXISTS email_otps (
          email TEXT PRIMARY KEY,
          otp_code TEXT NOT NULL,
          expires_at TIMESTAMPTZ NOT NULL,
          verified_at TIMESTAMPTZ,
          verification_token TEXT,
          consumed_at TIMESTAMPTZ,
          created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
        );

        CREATE TABLE IF NOT EXISTS meal_plans (
          id BIGSERIAL PRIMARY KEY,
          user_id TEXT NOT NULL,
          name TEXT,
          duration_days INTEGER NOT NULL DEFAULT 7,
          start_date DATE,
          end_date DATE,
          status TEXT DEFAULT 'draft',
          members TEXT,
          created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
          updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
          week_start TEXT NOT NULL DEFAULT '2026-02-23',
          day_index INTEGER NOT NULL,
          meal_type TEXT NOT NULL,
          dish_id TEXT NOT NULL,
          servings DOUBLE PRECISION NOT NULL DEFAULT 1,
          custom_ingredients TEXT,
          entry_order INTEGER NOT NULL DEFAULT 0
        );

        CREATE TABLE IF NOT EXISTS favourites (
          id BIGSERIAL PRIMARY KEY,
          user_id TEXT NOT NULL,
          dish_id TEXT NOT NULL,
          created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
          UNIQUE(user_id, dish_id)
        );

        CREATE TABLE IF NOT EXISTS shopping_selections (
          id BIGSERIAL PRIMARY KEY,
          user_id TEXT NOT NULL,
          week_start TEXT NOT NULL,
          day_index INTEGER NOT NULL,
          meal_type TEXT NOT NULL,
          UNIQUE(user_id, week_start, day_index, meal_type)
        );

        CREATE TABLE IF NOT EXISTS nutrient_thresholds (
          id BIGSERIAL PRIMARY KEY,
          user_id TEXT NOT NULL,
          nutrient_key TEXT NOT NULL,
          daily_value DOUBLE PRECISION,
          per_meal_value DOUBLE PRECISION,
          UNIQUE(user_id, nutrient_key)
        );

        CREATE TABLE IF NOT EXISTS family_members (
          id BIGSERIAL PRIMARY KEY,
          user_id TEXT NOT NULL,
          caretaker_id TEXT,
          name TEXT NOT NULL,
          avatar TEXT,
          conditions TEXT,
          dietary_prefs TEXT,
          allergies TEXT,
          age INTEGER,
          sex TEXT,
          weight_kg DOUBLE PRECISION,
          sort_order INTEGER,
          created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
          CONSTRAINT family_members_user_id_fkey
            FOREIGN KEY (user_id) REFERENCES users(id),
          CONSTRAINT family_members_caretaker_id_fkey
            FOREIGN KEY (caretaker_id) REFERENCES caretakers(id)
        );

        CREATE TABLE IF NOT EXISTS health_metrics (
          id BIGSERIAL PRIMARY KEY,
          user_id TEXT NOT NULL,
          date DATE NOT NULL,
          measurement_time TIME,
          blood_sugar DOUBLE PRECISION,
          systolic_bp DOUBLE PRECISION,
          diastolic_bp DOUBLE PRECISION,
          total_cholesterol DOUBLE PRECISION,
          ldl DOUBLE PRECISION,
          hdl DOUBLE PRECISION,
          triglycerides DOUBLE PRECISION,
          notes TEXT,
          created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
        );
        """,
    )
    conn.execute("CREATE INDEX IF NOT EXISTS idx_health_metrics_user_date ON health_metrics(user_id, date)")


def _has_column(conn: DBConnection, table: str, column: str) -> bool:
    row = conn.execute(
        """
        SELECT 1
        FROM information_schema.columns
        WHERE table_schema = 'public' AND table_name = ? AND column_name = ?
        """,
        (table, column),
    ).fetchone()
    return row is not None


def _table_exists(conn: DBConnection, table: str) -> bool:
    row = conn.execute(
        """
        SELECT 1
        FROM information_schema.tables
        WHERE table_schema = 'public' AND table_name = ?
        """,
        (table,),
    ).fetchone()
    return row is not None


def _column_type(conn: DBConnection, table: str, column: str) -> str | None:
    if not _has_column(conn, table, column):
        return None
    row = conn.execute(
        """
        SELECT data_type
        FROM information_schema.columns
        WHERE table_schema = 'public' AND table_name = ? AND column_name = ?
        """,
        (table, column),
    ).fetchone()
    if not row:
        return None
    return str(row["data_type"]).lower()


def _constraint_exists(conn: DBConnection, table: str, constraint_name: str) -> bool:
    row = conn.execute(
        """
        SELECT 1
        FROM pg_constraint
        WHERE conname = ? AND conrelid = to_regclass(?)
        """,
        (constraint_name, f"public.{table}"),
    ).fetchone()
    return row is not None


def _drop_fk_constraints_referencing(conn: DBConnection, referenced_table: str) -> None:
    rows = conn.execute(
        """
        SELECT conname, conrelid::regclass::text AS table_name
        FROM pg_constraint
        WHERE contype = 'f' AND confrelid = to_regclass(?)
        """,
        (f"public.{referenced_table}",),
    ).fetchall()
    for row in rows:
        conn.execute(f"ALTER TABLE {row['table_name']} DROP CONSTRAINT IF EXISTS {row['conname']}")


def _add_column_if_missing(conn: DBConnection, table: str, column: str, ddl_type: str) -> None:
    if not _has_column(conn, table, column):
        conn.execute(f"ALTER TABLE {table} ADD COLUMN {column} {ddl_type}")


def _migrate_schema(conn: DBConnection) -> None:
    users_id_type = _column_type(conn, "users", "id")
    if users_id_type in {"integer", "bigint", "smallint"}:
        _drop_fk_constraints_referencing(conn, "users")
        conn.execute("ALTER TABLE users ALTER COLUMN id DROP IDENTITY IF EXISTS")
        if _has_column(conn, "meal_plans", "user_id"):
            conn.execute("ALTER TABLE meal_plans ALTER COLUMN user_id TYPE TEXT USING user_id::text")
        if _has_column(conn, "shopping_selections", "user_id"):
            conn.execute("ALTER TABLE shopping_selections ALTER COLUMN user_id TYPE TEXT USING user_id::text")
        conn.execute("ALTER TABLE users ALTER COLUMN id TYPE TEXT USING id::text")

    caretakers_id_type = _column_type(conn, "caretakers", "id")
    if caretakers_id_type in {"integer", "bigint", "smallint"}:
        _drop_fk_constraints_referencing(conn, "caretakers")
        conn.execute("ALTER TABLE caretakers ALTER COLUMN id DROP IDENTITY IF EXISTS")
        if _has_column(conn, "users", "caretaker_id"):
            conn.execute("ALTER TABLE users ALTER COLUMN caretaker_id TYPE TEXT USING caretaker_id::text")
        conn.execute("ALTER TABLE caretakers ALTER COLUMN id TYPE TEXT USING id::text")

    _add_column_if_missing(conn, "meal_plans", "user_id", "TEXT")
    _add_column_if_missing(conn, "meal_plans", "dish_id", "TEXT")
    _add_column_if_missing(conn, "meal_plans", "week_start", "TEXT NOT NULL DEFAULT '2026-02-23'")
    _add_column_if_missing(conn, "meal_plans", "day_index", "INTEGER NOT NULL DEFAULT 0")
    _add_column_if_missing(conn, "meal_plans", "meal_type", "TEXT NOT NULL DEFAULT 'lunch'")
    _add_column_if_missing(conn, "meal_plans", "name", "TEXT")
    _add_column_if_missing(conn, "meal_plans", "duration_days", "INTEGER NOT NULL DEFAULT 7")
    _add_column_if_missing(conn, "meal_plans", "start_date", "DATE")
    _add_column_if_missing(conn, "meal_plans", "end_date", "DATE")
    _add_column_if_missing(conn, "meal_plans", "status", "TEXT DEFAULT 'draft'")
    _add_column_if_missing(conn, "meal_plans", "members", "TEXT")
    _add_column_if_missing(conn, "meal_plans", "created_at", "TIMESTAMPTZ NOT NULL DEFAULT NOW()")
    _add_column_if_missing(conn, "meal_plans", "updated_at", "TIMESTAMPTZ NOT NULL DEFAULT NOW()")
    _add_column_if_missing(conn, "meal_plans", "servings", "DOUBLE PRECISION NOT NULL DEFAULT 1")
    _add_column_if_missing(conn, "meal_plans", "custom_ingredients", "TEXT")
    _add_column_if_missing(conn, "meal_plans", "entry_order", "INTEGER NOT NULL DEFAULT 0")
    if _has_column(conn, "meal_plans", "duration_days"):
        conn.execute("UPDATE meal_plans SET duration_days = 7 WHERE duration_days IS NULL")
        conn.execute("ALTER TABLE meal_plans ALTER COLUMN duration_days SET DEFAULT 7")

    _add_column_if_missing(conn, "shopping_selections", "user_id", "TEXT")
    _add_column_if_missing(conn, "shopping_selections", "week_start", "TEXT NOT NULL DEFAULT '2026-02-23'")
    _add_column_if_missing(conn, "shopping_selections", "day_index", "INTEGER NOT NULL DEFAULT 0")
    _add_column_if_missing(conn, "shopping_selections", "meal_type", "TEXT NOT NULL DEFAULT 'lunch'")

    _add_column_if_missing(conn, "caretakers", "subscription_tier", "TEXT NOT NULL DEFAULT 'free'")

    if _table_exists(conn, "family_members"):
        fm_user_id_type = _column_type(conn, "family_members", "user_id")
        if fm_user_id_type in {"integer", "bigint", "smallint"}:
            conn.execute("ALTER TABLE family_members ALTER COLUMN user_id TYPE TEXT USING user_id::text")
        _add_column_if_missing(conn, "family_members", "user_id", "TEXT")
        _add_column_if_missing(conn, "family_members", "caretaker_id", "TEXT")
        _add_column_if_missing(conn, "family_members", "name", "TEXT")
        _add_column_if_missing(conn, "family_members", "avatar", "TEXT")
        _add_column_if_missing(conn, "family_members", "conditions", "TEXT")
        _add_column_if_missing(conn, "family_members", "dietary_prefs", "TEXT")
        _add_column_if_missing(conn, "family_members", "allergies", "TEXT")
        _add_column_if_missing(conn, "family_members", "age", "INTEGER")
        _add_column_if_missing(conn, "family_members", "sex", "TEXT")
        _add_column_if_missing(conn, "family_members", "weight_kg", "DOUBLE PRECISION")
        _add_column_if_missing(conn, "family_members", "sort_order", "INTEGER")
        _add_column_if_missing(conn, "family_members", "created_at", "TIMESTAMPTZ NOT NULL DEFAULT NOW()")

        # Repair legacy rows where family_members.user_id previously stored member profile IDs.
        # 1) Fill caretaker_id from legacy users.caretaker_id when possible.
        if _has_column(conn, "users", "caretaker_id"):
            conn.execute(
                """
                UPDATE family_members fm
                SET caretaker_id = u.caretaker_id
                FROM users u
                WHERE fm.caretaker_id IS NULL
                  AND u.id = fm.user_id
                  AND u.caretaker_id IS NOT NULL
                """
            )
        # 2) For rows with caretaker_id, remap user_id to caretaker owner auth_user_id.
        conn.execute(
            """
            UPDATE family_members fm
            SET user_id = c.auth_user_id
            FROM caretakers c
            WHERE fm.caretaker_id = c.id
              AND c.auth_user_id IS NOT NULL
              AND NOT EXISTS (SELECT 1 FROM users u WHERE u.id = fm.user_id)
            """
        )
        # 3) Remove orphans that still don't map to a valid user; otherwise FK creation will fail.
        conn.execute(
            """
            DELETE FROM family_members fm
            WHERE NOT EXISTS (SELECT 1 FROM users u WHERE u.id = fm.user_id)
            """
        )

        if not _constraint_exists(conn, "family_members", "family_members_user_id_fkey"):
            conn.execute(
                """
                ALTER TABLE family_members
                ADD CONSTRAINT family_members_user_id_fkey
                FOREIGN KEY (user_id) REFERENCES users(id)
                """
            )
        if not _constraint_exists(conn, "family_members", "family_members_caretaker_id_fkey"):
            conn.execute(
                """
                ALTER TABLE family_members
                ADD CONSTRAINT family_members_caretaker_id_fkey
                FOREIGN KEY (caretaker_id) REFERENCES caretakers(id)
                """
            )
        conn.execute("CREATE INDEX IF NOT EXISTS idx_family_members_user ON family_members(user_id)")
        conn.execute("CREATE INDEX IF NOT EXISTS idx_family_members_caretaker ON family_members(caretaker_id)")
        # Backfill legacy diners previously stored in users into family_members.
        if _has_column(conn, "users", "caretaker_id"):
            conn.execute(
                """
                INSERT INTO family_members (user_id, caretaker_id, name, conditions, dietary_prefs, allergies, age, sex, weight_kg, sort_order)
                SELECT
                  c.auth_user_id,
                  u.caretaker_id,
                  COALESCE(u.name, 'Diner'),
                  COALESCE(u.conditions, '[]'),
                  COALESCE(u.diet, 'none'),
                  COALESCE(u.allergies, '[]'),
                  u.age,
                  u.sex,
                  u.weight_kg,
                  1
                FROM users u
                JOIN caretakers c ON c.id = u.caretaker_id
                WHERE u.caretaker_id IS NOT NULL
                  AND c.auth_user_id IS NOT NULL
                  AND NOT EXISTS (
                    SELECT 1 FROM family_members fm
                    WHERE fm.caretaker_id = u.caretaker_id
                      AND lower(fm.name) = lower(COALESCE(u.name, 'Diner'))
                  )
                """
            )

    if not _table_exists(conn, "nutrient_thresholds"):
        _executescript(conn, """
            CREATE TABLE IF NOT EXISTS nutrient_thresholds (
              id BIGSERIAL PRIMARY KEY,
              user_id TEXT NOT NULL,
              nutrient_key TEXT NOT NULL,
              daily_value DOUBLE PRECISION,
              per_meal_value DOUBLE PRECISION,
              UNIQUE(user_id, nutrient_key)
            )
        """)
    conn.execute("CREATE INDEX IF NOT EXISTS idx_nutrient_thresholds_user ON nutrient_thresholds(user_id)")

    # -- health_metrics table --
    if not _table_exists(conn, "health_metrics"):
        _executescript(conn, """
            CREATE TABLE IF NOT EXISTS health_metrics (
              id BIGSERIAL PRIMARY KEY,
              user_id TEXT NOT NULL,
              date DATE NOT NULL,
              measurement_time TIME,
              blood_sugar DOUBLE PRECISION,
              systolic_bp DOUBLE PRECISION,
              diastolic_bp DOUBLE PRECISION,
              total_cholesterol DOUBLE PRECISION,
              ldl DOUBLE PRECISION,
              hdl DOUBLE PRECISION,
              triglycerides DOUBLE PRECISION,
              notes TEXT,
              created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
            )
        """)
    conn.execute("CREATE INDEX IF NOT EXISTS idx_health_metrics_user_date ON health_metrics(user_id, date)")

    conn.execute("DROP INDEX IF EXISTS idx_meal_plans_user")
    conn.execute(
        "CREATE INDEX IF NOT EXISTS idx_meal_plans_user "
        "ON meal_plans(user_id, week_start, day_index, meal_type)"
    )

    _add_column_if_missing(conn, "users", "name", "TEXT NOT NULL DEFAULT 'Diner'")
    _add_column_if_missing(conn, "users", "age", "INTEGER")
    _add_column_if_missing(conn, "users", "sex", "TEXT")
    _add_column_if_missing(conn, "users", "weight_kg", "DOUBLE PRECISION")
    _add_column_if_missing(conn, "users", "caretaker_id", "TEXT")
    _add_column_if_missing(conn, "users", "conditions", "TEXT NOT NULL DEFAULT '[]'")
    _add_column_if_missing(conn, "users", "diet", "TEXT NOT NULL DEFAULT 'none'")
    _add_column_if_missing(conn, "users", "allergies", "TEXT NOT NULL DEFAULT '[]'")
    _add_column_if_missing(conn, "users", "recommended_calories", "DOUBLE PRECISION")
    _add_column_if_missing(conn, "users", "recommended_protein", "DOUBLE PRECISION")
    _add_column_if_missing(conn, "users", "recommended_carbs", "DOUBLE PRECISION")
    _add_column_if_missing(conn, "users", "recommended_fat", "DOUBLE PRECISION")
    _add_column_if_missing(conn, "users", "created_at", "TIMESTAMPTZ NOT NULL DEFAULT NOW()")
    if _has_column(conn, "users", "dietary_habits") and _has_column(conn, "users", "diet"):
        conn.execute(
            """
            UPDATE users
            SET diet = dietary_habits
            WHERE (diet IS NULL OR diet = '' OR diet = 'none')
              AND dietary_habits IS NOT NULL
              AND dietary_habits <> ''
            """
        )
    _add_column_if_missing(conn, "users", "email", "TEXT")
    _add_column_if_missing(conn, "users", "password_hash", "TEXT")
    _add_column_if_missing(conn, "users", "email_verified_at", "TIMESTAMPTZ")
    conn.execute("CREATE UNIQUE INDEX IF NOT EXISTS idx_users_email_unique ON users(email)")

    # Fold legacy auth_users identity data into users, then retire auth_users table.
    if _table_exists(conn, "auth_users"):
        conn.execute(
            """
            UPDATE users u
            SET
              email = au.email,
              password_hash = au.password_hash,
              email_verified_at = au.email_verified_at
            FROM auth_users au
            WHERE u.id = au.id
            """
        )
        conn.execute(
            """
            INSERT INTO users (id, email, password_hash, email_verified_at, name, conditions, diet, allergies)
            SELECT
              au.id, au.email, au.password_hash, au.email_verified_at,
              'Diner', '[]', 'none', '[]'
            FROM auth_users au
            WHERE NOT EXISTS (SELECT 1 FROM users u WHERE u.id = au.id)
            """
        )
        conn.execute("DROP TABLE IF EXISTS auth_users")

    _add_column_if_missing(conn, "caretakers", "auth_user_id", "TEXT")
    conn.execute("CREATE UNIQUE INDEX IF NOT EXISTS idx_caretakers_auth_user_id ON caretakers(auth_user_id)")

    if _has_column(conn, "recipes", "steps"):
        conn.execute("ALTER TABLE recipes ALTER COLUMN steps SET DEFAULT '[]'")
        conn.execute("UPDATE recipes SET steps = '[]' WHERE steps IS NULL")

    _add_column_if_missing(conn, "recipes", "url", "TEXT")
    _add_column_if_missing(conn, "recipes", "description", "TEXT")
    _add_column_if_missing(conn, "recipes", "total_time", "TEXT")
    _add_column_if_missing(conn, "recipes", "servings", "TEXT")
    _add_column_if_missing(conn, "recipes", "category", "TEXT")
    _add_column_if_missing(conn, "recipes", "cuisine", "TEXT")
    _add_column_if_missing(conn, "recipes", "keywords", "TEXT")
    _add_column_if_missing(conn, "recipes", "ingredients", "TEXT")
    _add_column_if_missing(conn, "recipes", "ingredients_raw", "TEXT")
    _add_column_if_missing(conn, "recipes", "instructions", "TEXT")
    _add_column_if_missing(conn, "recipes", "image_url", "TEXT")
    _add_column_if_missing(conn, "recipes", "calories", "TEXT")
    _add_column_if_missing(conn, "recipes", "protein", "TEXT")
    _add_column_if_missing(conn, "recipes", "fat", "TEXT")
    _add_column_if_missing(conn, "recipes", "total_carbs", "TEXT")
    _add_column_if_missing(conn, "recipes", "fiber", "TEXT")
    _add_column_if_missing(conn, "recipes", "sugar", "TEXT")
    _add_column_if_missing(conn, "recipes", "cholesterol", "TEXT")
    _add_column_if_missing(conn, "recipes", "sodium", "TEXT")
    _add_column_if_missing(conn, "recipes", "saturated_fat", "TEXT")
    _add_column_if_missing(conn, "recipes", "trans_fat", "TEXT")
    _add_column_if_missing(conn, "recipes", "net_carbs", "TEXT")
    _add_column_if_missing(conn, "recipes", "vitamin_c", "TEXT")
    _add_column_if_missing(conn, "recipes", "potassium", "TEXT")
    _add_column_if_missing(conn, "recipes", "calcium", "TEXT")
    _add_column_if_missing(conn, "recipes", "iron", "TEXT")
    _add_column_if_missing(conn, "recipes", "allergies", "TEXT")
    _add_column_if_missing(conn, "recipes", "dietary_habits", "TEXT")
    _add_column_if_missing(conn, "recipes", "hypertension_category", "TEXT")
    _add_column_if_missing(conn, "recipes", "diabetes_category", "TEXT")
    _add_column_if_missing(conn, "recipes", "cholesterol_category", "TEXT")
    _add_column_if_missing(conn, "recipes", "gout_category", "TEXT")
    _add_column_if_missing(conn, "recipes", "is_vegetarian", "BOOLEAN NOT NULL DEFAULT FALSE")
    _add_column_if_missing(conn, "recipes", "is_vegan", "BOOLEAN NOT NULL DEFAULT FALSE")
    _add_column_if_missing(conn, "recipes", "is_gluten_free", "BOOLEAN NOT NULL DEFAULT FALSE")
    _add_column_if_missing(conn, "recipes", "is_dairy_free", "BOOLEAN NOT NULL DEFAULT FALSE")
    _add_column_if_missing(conn, "recipes", "is_low_carb", "BOOLEAN NOT NULL DEFAULT FALSE")
    _add_column_if_missing(conn, "recipes", "is_high_protein", "BOOLEAN NOT NULL DEFAULT FALSE")
    _add_column_if_missing(conn, "recipes", "is_spicy", "BOOLEAN NOT NULL DEFAULT FALSE")
    _add_column_if_missing(conn, "recipes", "is_sweet", "BOOLEAN NOT NULL DEFAULT FALSE")
    _add_column_if_missing(conn, "recipes", "is_salty", "BOOLEAN NOT NULL DEFAULT FALSE")


def _read_meta(conn: DBConnection, key: str) -> str | None:
    row = conn.execute("SELECT value FROM meta WHERE key = ?", (key,)).fetchone()
    if not row:
        return None
    return row["value"]


def _write_meta(conn: DBConnection, key: str, value: str) -> None:
    conn.execute(
        """
        INSERT INTO meta (key, value)
        VALUES (?, ?)
        ON CONFLICT(key) DO UPDATE SET value = excluded.value
        """,
        (key, value),
    )


def _seed_from_dataset(conn: DBConnection) -> None:
    try:
        seed_data = load_seed_data()
    except FileNotFoundError:
        return

    data_version = seed_data["version"]
    existing_version = _read_meta(conn, "dataset_version")
    recipes_count_row = conn.execute("SELECT COUNT(*) AS c FROM recipes").fetchone()
    recipes_count = recipes_count_row["c"] if recipes_count_row else 0

    needs_seed = recipes_count == 0 or recipes_count < 100 or existing_version != data_version
    if not needs_seed:
        return

    conn.execute("DELETE FROM shopping_selections")
    conn.execute("DELETE FROM meal_plans")
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
        INSERT INTO recipes (
            id, name, prep_time, cook_time, category, keywords, ingredients, instructions,
            description, url, image_url, servings, calories, protein, fat, total_carbs, fiber, sugar, cholesterol, sodium,
            is_vegetarian, is_vegan, is_low_carb, is_high_protein, is_spicy, is_sweet, is_salty,
            allergies, dietary_habits, hypertension_category, diabetes_category, cholesterol_category, gout_category,
            ingredients_raw
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """,
        [
            (
                recipe_id.removeprefix("r"),
                r["name"],
                str(r["prepTime"]),
                str(r["cookTime"]),
                r.get("category") or "",
                "",
                json.dumps(r.get("ingredients") or {}),
                json.dumps(r["steps"]),
                "",
                "",
                r.get("imageUrl") or "",
                str(r.get("servingsCount") or 1),
                str(r.get("calories") or 0),
                str(r.get("protein") or 0),
                str(r.get("fat") or 0),
                str(r.get("totalCarbs") or 0),
                str(r.get("fiber") or 0),
                str(r.get("sugar") or 0),
                str(r.get("cholesterol") or 0),
                str(r.get("sodium") or 0),
                False,
                False,
                False,
                False,
                False,
                False,
                False,
                json.dumps(r.get("allergies") or []),
                "",
                r.get("hypertensionCategory") or "",
                r.get("diabetesCategory") or "",
                r.get("cholesterolCategory") or "",
                r.get("goutCategory") or "",
                r.get("ingredientsRaw") or "",
            )
            for recipe_id, r in seed_data["recipes"].items()
        ],
    )

    _write_meta(conn, "dataset_version", data_version)


def _backfill_recipe_nutrients(conn: DBConnection) -> None:
    """Update existing recipes that were seeded with 0-value nutrients."""
    if _read_meta(conn, "nutrients_backfilled"):
        return

    row = conn.execute(
        "SELECT COUNT(*) AS c FROM recipes WHERE calories IS NULL OR calories = '0' OR calories = ''"
    ).fetchone()
    if not row or row["c"] == 0:
        _write_meta(conn, "nutrients_backfilled", "1")
        return

    try:
        seed_data = load_seed_data()
    except FileNotFoundError:
        return

    for recipe_id, r in seed_data["recipes"].items():
        numeric_id = recipe_id.removeprefix("r")
        conn.execute(
            """
            UPDATE recipes
            SET calories = ?, protein = ?, fat = ?, total_carbs = ?,
                fiber = ?, sugar = ?, cholesterol = ?, sodium = ?
            WHERE id::text = ?
            """,
            (
                str(r.get("calories") or 0),
                str(r.get("protein") or 0),
                str(r.get("fat") or 0),
                str(r.get("totalCarbs") or 0),
                str(r.get("fiber") or 0),
                str(r.get("sugar") or 0),
                str(r.get("cholesterol") or 0),
                str(r.get("sodium") or 0),
                numeric_id,
            ),
        )

    _write_meta(conn, "nutrients_backfilled", "1")


def _backfill_recipe_ingredients(conn: DBConnection) -> None:
    """Update existing recipes that were seeded with empty ingredients."""
    if _read_meta(conn, "ingredients_backfilled"):
        return

    row = conn.execute(
        "SELECT COUNT(*) AS c FROM recipes WHERE ingredients IS NULL OR ingredients = '' OR ingredients = '{}'"
    ).fetchone()
    if not row or row["c"] == 0:
        _write_meta(conn, "ingredients_backfilled", "1")
        return

    try:
        seed_data = load_seed_data()
    except FileNotFoundError:
        return

    for recipe_id, r in seed_data["recipes"].items():
        numeric_id = recipe_id.removeprefix("r")
        conn.execute(
            "UPDATE recipes SET ingredients = ? WHERE id::text = ?",
            (json.dumps(r.get("ingredients") or {}), numeric_id),
        )

    _write_meta(conn, "ingredients_backfilled", "1")


def _backfill_recipe_ingredients_raw(conn: DBConnection) -> None:
    """Populate ingredients_raw for recipes that don't have it yet."""
    if _read_meta(conn, "ingredients_raw_backfilled"):
        return

    row = conn.execute(
        "SELECT COUNT(*) AS c FROM recipes WHERE ingredients_raw IS NULL OR ingredients_raw = ''"
    ).fetchone()
    if not row or row["c"] == 0:
        _write_meta(conn, "ingredients_raw_backfilled", "1")
        return

    try:
        seed_data = load_seed_data()
    except FileNotFoundError:
        return

    for recipe_id, r in seed_data["recipes"].items():
        numeric_id = recipe_id.removeprefix("r")
        conn.execute(
            "UPDATE recipes SET ingredients_raw = ? WHERE id::text = ?",
            (r.get("ingredientsRaw") or "", numeric_id),
        )

    _write_meta(conn, "ingredients_raw_backfilled", "1")


def _backfill_recipe_diet_flags(conn: DBConnection) -> None:
    """Update boolean diet-flag columns that were seeded as all-False."""
    if _read_meta(conn, "diet_flags_backfilled"):
        return

    row = conn.execute(
        "SELECT COUNT(*) AS c FROM recipes WHERE is_vegetarian = FALSE AND is_vegan = FALSE AND is_low_carb = FALSE"
    ).fetchone()
    if not row or row["c"] == 0:
        _write_meta(conn, "diet_flags_backfilled", "1")
        return

    try:
        seed_data = load_seed_data()
    except FileNotFoundError:
        return

    FLAG_KEYS = {"vegetarian", "vegan", "gluten_free", "dairy_free", "low_carb", "high_protein", "spicy", "sweet", "salty"}

    for dish in seed_data["dishes"]:
        recipe_id = dish.get("recipeId", "")
        numeric_id = recipe_id.removeprefix("r")
        if not numeric_id:
            continue
        tags = set(dish.get("tags", []))
        flags = {k: (k in tags) for k in FLAG_KEYS}
        conn.execute(
            """
            UPDATE recipes SET
                is_vegetarian = ?,
                is_vegan = ?,
                is_gluten_free = ?,
                is_dairy_free = ?,
                is_low_carb = ?,
                is_high_protein = ?,
                is_spicy = ?,
                is_sweet = ?,
                is_salty = ?
            WHERE id::text = ?
            """,
            (
                flags["vegetarian"],
                flags["vegan"],
                flags["gluten_free"],
                flags["dairy_free"],
                flags["low_carb"],
                flags["high_protein"],
                flags["spicy"],
                flags["sweet"],
                flags["salty"],
                numeric_id,
            ),
        )

    _write_meta(conn, "diet_flags_backfilled", "1")


def _backfill_strip_ingredient_bullets(conn: DBConnection) -> None:
    """Strip leading bullet-point characters from ingredient JSON keys."""
    if _read_meta(conn, "ingredient_bullets_stripped"):
        return

    import re as _re
    _BULLET_RE = _re.compile(r'^[\-\*\u2022\u00B7\u2023\u25BA\u25AA\u25E6\s]+')

    rows = conn.execute(
        "SELECT id, ingredients FROM recipes WHERE ingredients IS NOT NULL AND ingredients != '' AND ingredients != '{}'"
    ).fetchall()

    for row in rows:
        try:
            ing = json.loads(row["ingredients"])
        except (json.JSONDecodeError, TypeError):
            continue
        if not isinstance(ing, dict):
            continue
        if not any(_BULLET_RE.match(k) for k in ing if k):
            continue
        cleaned: dict = {}
        for k, v in ing.items():
            clean_key = _BULLET_RE.sub("", k).strip()
            if clean_key:
                cleaned[clean_key] = cleaned.get(clean_key, 0) + v
        conn.execute(
            "UPDATE recipes SET ingredients = ? WHERE id::text = ?",
            (json.dumps(cleaned), str(row["id"])),
        )

    _write_meta(conn, "ingredient_bullets_stripped", "1")


def _backfill_health_categories(conn: DBConnection) -> None:
    """Populate hypertension/diabetes/cholesterol category columns from dataset."""
    if _read_meta(conn, "health_categories_backfilled"):
        return

    row = conn.execute(
        "SELECT COUNT(*) AS c FROM recipes WHERE (hypertension_category IS NULL OR hypertension_category = '') "
        "AND (diabetes_category IS NULL OR diabetes_category = '') "
        "AND (cholesterol_category IS NULL OR cholesterol_category = '')"
    ).fetchone()
    if not row or row["c"] == 0:
        _write_meta(conn, "health_categories_backfilled", "1")
        return

    try:
        seed_data = load_seed_data()
    except FileNotFoundError:
        return

    for recipe_id, r in seed_data["recipes"].items():
        numeric_id = recipe_id.removeprefix("r")
        hyp = r.get("hypertensionCategory") or ""
        dia = r.get("diabetesCategory") or ""
        cho = r.get("cholesterolCategory") or ""
        gou = r.get("goutCategory") or ""
        if hyp or dia or cho or gou:
            conn.execute(
                """
                UPDATE recipes
                SET hypertension_category = ?, diabetes_category = ?, cholesterol_category = ?, gout_category = ?
                WHERE id::text = ?
                """,
                (hyp, dia, cho, gou, numeric_id),
            )

    _write_meta(conn, "health_categories_backfilled", "1")


def _backfill_recipe_category(conn: DBConnection) -> None:
    """Populate the category column from the dataset CSV."""
    if _read_meta(conn, "category_backfilled"):
        return

    row = conn.execute(
        "SELECT COUNT(*) AS c FROM recipes WHERE category IS NULL OR category = ''"
    ).fetchone()
    if not row or row["c"] == 0:
        _write_meta(conn, "category_backfilled", "1")
        return

    try:
        seed_data = load_seed_data()
    except FileNotFoundError:
        return

    for recipe_id, r in seed_data["recipes"].items():
        cat = r.get("category") or ""
        if cat:
            numeric_id = recipe_id.removeprefix("r")
            conn.execute(
                "UPDATE recipes SET category = ? WHERE id::text = ?",
                (cat, numeric_id),
            )

    _write_meta(conn, "category_backfilled", "1")


def _backfill_recipe_allergies(conn: DBConnection) -> None:
    """Populate the allergies column from the dataset CSV."""
    if _read_meta(conn, "allergies_backfilled"):
        return

    row = conn.execute(
        "SELECT COUNT(*) AS c FROM recipes WHERE allergies IS NULL OR allergies = '' OR allergies = '[]'"
    ).fetchone()
    if not row or row["c"] == 0:
        _write_meta(conn, "allergies_backfilled", "1")
        return

    try:
        seed_data = load_seed_data()
    except FileNotFoundError:
        return

    for recipe_id, r in seed_data["recipes"].items():
        allerg = r.get("allergies") or []
        if allerg:
            numeric_id = recipe_id.removeprefix("r")
            conn.execute(
                "UPDATE recipes SET allergies = ? WHERE id::text = ?",
                (json.dumps(allerg), numeric_id),
            )

    _write_meta(conn, "allergies_backfilled", "1")


def _backfill_recipe_image_url(conn: DBConnection) -> None:
    """Populate the image_url column from the dataset CSV."""
    if _read_meta(conn, "image_url_backfilled"):
        return

    row = conn.execute(
        "SELECT COUNT(*) AS c FROM recipes WHERE image_url IS NULL OR image_url = ''"
    ).fetchone()
    if not row or row["c"] == 0:
        _write_meta(conn, "image_url_backfilled", "1")
        return

    try:
        seed_data = load_seed_data()
    except FileNotFoundError:
        return

    for recipe_id, r in seed_data["recipes"].items():
        url = r.get("imageUrl") or ""
        if url:
            numeric_id = recipe_id.removeprefix("r")
            conn.execute(
                "UPDATE recipes SET image_url = ? WHERE id::text = ?",
                (url, numeric_id),
            )

    _write_meta(conn, "image_url_backfilled", "1")
