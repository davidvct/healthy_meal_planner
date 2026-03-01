from __future__ import annotations

from datetime import date, datetime, timedelta
import sqlite3

from ..constants import MEAL_CUTOFF
from ..utils import get_current_week_start, parse_json


def is_slot_expired(week_start: str, day_index: int, meal_type: str) -> bool:
    now = datetime.now()
    monday = datetime.fromisoformat(f"{week_start}T00:00:00")
    slot_date = monday + timedelta(days=int(day_index))

    today = date.today()
    if slot_date.date() < today:
        return True
    if slot_date.date() == today:
        cutoff = MEAL_CUTOFF.get(meal_type)
        if cutoff is not None and now.hour >= cutoff:
            return True
    return False


def get_shopping_list(
    conn: sqlite3.Connection,
    user_id: str,
    week_start: str | None,
    selections: list[dict[str, int | str]] | None,
) -> list[dict[str, int | str]]:
    ws = week_start or get_current_week_start()

    if not selections:
        return []

    rows = conn.execute(
        """
        SELECT mp.day_index, mp.meal_type, mp.servings, mp.custom_ingredients, d.ingredients
        FROM meal_plans mp
        JOIN dishes d ON d.id = mp.dish_id
        WHERE mp.user_id = ? AND mp.week_start = ?
        """,
        (user_id, ws),
    ).fetchall()

    selected_keys = {f"{s['dayIndex']}-{s['mealType']}" for s in selections}

    totals: dict[str, float] = {}
    for row in rows:
        key = f"{row['day_index']}-{row['meal_type']}"
        if key not in selected_keys:
            continue

        dish_ingredients = parse_json(row["ingredients"], {})
        custom = parse_json(row["custom_ingredients"], None)
        ingredients = custom or {
            k: float(v) * float(row["servings"]) for k, v in dish_ingredients.items()
        }

        for ingredient, amount in ingredients.items():
            totals[ingredient] = totals.get(ingredient, 0) + float(amount)

    return [
        {"name": ingredient, "grams": int(round(grams))}
        for ingredient, grams in sorted(totals.items(), key=lambda kv: kv[0])
    ]
