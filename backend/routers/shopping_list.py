import sqlite3

from fastapi import APIRouter, Depends, HTTPException

from ..db import get_db
from ..schemas import ToggleShoppingSelectionBody
from ..services.shopping_list_generator import get_shopping_list, is_slot_expired

router = APIRouter(prefix="/shopping-list", tags=["shopping-list"])


@router.get("/{user_id}")
def get_user_shopping_list(
    user_id: str,
    weekStart: str | None = None,
    conn: sqlite3.Connection = Depends(get_db),
) -> dict:
    if weekStart:
        raw_selections = conn.execute(
            "SELECT day_index, meal_type FROM shopping_selections WHERE user_id = ? AND week_start = ?",
            (user_id, weekStart),
        ).fetchall()
    else:
        raw_selections = conn.execute(
            "SELECT day_index, meal_type FROM shopping_selections WHERE user_id = ?",
            (user_id,),
        ).fetchall()

    expired = []
    valid = []
    for selection in raw_selections:
        if weekStart and is_slot_expired(weekStart, selection["day_index"], selection["meal_type"]):
            expired.append(selection)
        else:
            valid.append({"dayIndex": selection["day_index"], "mealType": selection["meal_type"]})

    if weekStart and expired:
        for selection in expired:
            conn.execute(
                "DELETE FROM shopping_selections WHERE user_id = ? AND week_start = ? AND day_index = ? AND meal_type = ?",
                (user_id, weekStart, selection["day_index"], selection["meal_type"]),
            )
        conn.commit()

    total_dishes = 0
    if weekStart and valid:
        for selection in valid:
            count_row = conn.execute(
                """
                SELECT COUNT(*) as c
                FROM meal_plans
                WHERE user_id = ? AND week_start = ? AND day_index = ? AND meal_type = ?
                """,
                (user_id, weekStart, selection["dayIndex"], selection["mealType"]),
            ).fetchone()
            total_dishes += count_row["c"]

    items = get_shopping_list(conn, user_id, weekStart, valid)
    return {"totalDishes": total_dishes, "items": items, "selections": valid}


@router.post("/{user_id}/toggle-selection")
def toggle_shopping_selection(
    user_id: str,
    body: ToggleShoppingSelectionBody,
    conn: sqlite3.Connection = Depends(get_db),
) -> dict:
    existing = conn.execute(
        """
        SELECT id
        FROM shopping_selections
        WHERE user_id = ? AND week_start = ? AND day_index = ? AND meal_type = ?
        """,
        (user_id, body.weekStart, body.dayIndex, body.mealType),
    ).fetchone()

    if existing:
        conn.execute("DELETE FROM shopping_selections WHERE id = ?", (existing["id"],))
    else:
        conn.execute(
            """
            INSERT INTO shopping_selections (user_id, week_start, day_index, meal_type)
            VALUES (?, ?, ?, ?)
            """,
            (user_id, body.weekStart, body.dayIndex, body.mealType),
        )
    conn.commit()

    raw = conn.execute(
        "SELECT day_index, meal_type FROM shopping_selections WHERE user_id = ? AND week_start = ?",
        (user_id, body.weekStart),
    ).fetchall()

    selections = [
        {"dayIndex": selection["day_index"], "mealType": selection["meal_type"]}
        for selection in raw
        if not is_slot_expired(body.weekStart, selection["day_index"], selection["meal_type"])
    ]

    return {"selections": selections}
