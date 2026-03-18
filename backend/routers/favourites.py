from typing import Any

from fastapi import APIRouter, Depends

from ..db import get_db

router = APIRouter(prefix="/favourites", tags=["favourites"])


@router.get("/{user_id}")
def get_favourites(user_id: str, conn: Any = Depends(get_db)) -> list[str]:
    rows = conn.execute(
        "SELECT dish_id FROM favourites WHERE user_id = ? ORDER BY created_at DESC",
        (user_id,),
    ).fetchall()
    return [row["dish_id"] for row in rows]


@router.post("/{user_id}/{dish_id}")
def add_favourite(user_id: str, dish_id: str, conn: Any = Depends(get_db)) -> dict[str, bool]:
    conn.execute(
        """
        INSERT INTO favourites (user_id, dish_id)
        VALUES (?, ?)
        ON CONFLICT (user_id, dish_id) DO NOTHING
        """,
        (user_id, dish_id),
    )
    conn.commit()
    return {"success": True}


@router.delete("/{user_id}/{dish_id}")
def remove_favourite(user_id: str, dish_id: str, conn: Any = Depends(get_db)) -> dict[str, bool]:
    conn.execute(
        "DELETE FROM favourites WHERE user_id = ? AND dish_id = ?",
        (user_id, dish_id),
    )
    conn.commit()
    return {"success": True}
