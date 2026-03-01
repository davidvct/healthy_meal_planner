import json
import sqlite3
import uuid

from fastapi import APIRouter, Depends, HTTPException

from ..db import get_db
from ..schemas import CreateCaretakerBody

router = APIRouter(prefix="/caretakers", tags=["caretakers"])


@router.post("")
def create_caretaker(body: CreateCaretakerBody, conn: sqlite3.Connection = Depends(get_db)) -> dict[str, str]:
    name = body.name.strip()
    if not name:
        raise HTTPException(status_code=400, detail="Name is required")

    caretaker_id = str(uuid.uuid4())
    conn.execute("INSERT INTO caretakers (id, name) VALUES (?, ?)", (caretaker_id, name))
    conn.commit()
    return {"caretakerId": caretaker_id, "name": name}


@router.get("/{caretaker_id}")
def get_caretaker(caretaker_id: str, conn: sqlite3.Connection = Depends(get_db)) -> dict[str, str]:
    row = conn.execute("SELECT * FROM caretakers WHERE id = ?", (caretaker_id,)).fetchone()
    if not row:
        raise HTTPException(status_code=404, detail="Caretaker not found")
    return {"caretakerId": row["id"], "name": row["name"]}


@router.get("/{caretaker_id}/diners")
def get_diners(caretaker_id: str, conn: sqlite3.Connection = Depends(get_db)) -> list[dict]:
    rows = conn.execute(
        "SELECT * FROM users WHERE caretaker_id = ? ORDER BY created_at ASC", (caretaker_id,)
    ).fetchall()

    return [
        {
            "userId": row["id"],
            "name": row["name"],
            "age": row["age"],
            "sex": row["sex"],
            "weightKg": row["weight_kg"],
            "conditions": json.loads(row["conditions"]),
            "diet": row["diet"],
            "allergies": json.loads(row["allergies"]),
        }
        for row in rows
    ]
