from typing import Any
import json
import uuid

from fastapi import APIRouter, Depends, HTTPException

from ..db import get_db
from ..schemas import CreateCaretakerBody, UpdateTierBody

router = APIRouter(prefix="/caretakers", tags=["caretakers"])


@router.post("")
def create_caretaker(body: CreateCaretakerBody, conn: Any = Depends(get_db)) -> dict[str, str]:
    name = body.name.strip()
    if not name:
        raise HTTPException(status_code=400, detail="Name is required")

    auth_user_id = body.authUserId.strip() if body.authUserId else None
    if auth_user_id:
        existing = conn.execute(
            "SELECT id, name FROM caretakers WHERE auth_user_id = ?",
            (auth_user_id,),
        ).fetchone()
        if existing:
            conn.execute(
                "UPDATE caretakers SET name = ? WHERE id = ?",
                (name, existing["id"]),
            )
            conn.commit()
            return {"caretakerId": existing["id"], "name": name}

    caretaker_id = str(uuid.uuid4())
    conn.execute(
        "INSERT INTO caretakers (id, name, auth_user_id) VALUES (?, ?, ?)",
        (caretaker_id, name, auth_user_id),
    )
    conn.commit()
    return {"caretakerId": caretaker_id, "name": name}


@router.get("/by-auth/{auth_user_id}")
def get_caretaker_by_auth(auth_user_id: str, conn: Any = Depends(get_db)) -> dict[str, str]:
    row = conn.execute("SELECT * FROM caretakers WHERE auth_user_id = ?", (auth_user_id,)).fetchone()
    if not row:
        raise HTTPException(status_code=404, detail="Caretaker not found")
    return {"caretakerId": row["id"], "name": row["name"], "tier": row.get("subscription_tier") or "free"}


@router.put("/{caretaker_id}/tier")
def update_tier(caretaker_id: str, body: UpdateTierBody, conn: Any = Depends(get_db)) -> dict:
    row = conn.execute("SELECT id FROM caretakers WHERE id = ?", (caretaker_id,)).fetchone()
    if not row:
        raise HTTPException(status_code=404, detail="Caretaker not found")
    conn.execute(
        "UPDATE caretakers SET subscription_tier = ? WHERE id = ?",
        (body.tier, caretaker_id),
    )
    conn.commit()
    return {"caretakerId": caretaker_id, "tier": body.tier}


@router.get("/{caretaker_id}")
def get_caretaker(caretaker_id: str, conn: Any = Depends(get_db)) -> dict[str, str]:
    row = conn.execute("SELECT * FROM caretakers WHERE id = ?", (caretaker_id,)).fetchone()
    if not row:
        raise HTTPException(status_code=404, detail="Caretaker not found")
    return {"caretakerId": row["id"], "name": row["name"], "tier": row.get("subscription_tier") or "free"}


@router.get("/{caretaker_id}/diners")
def get_diners(caretaker_id: str, conn: Any = Depends(get_db)) -> list[dict]:
    caretaker = conn.execute("SELECT auth_user_id FROM caretakers WHERE id = ?", (caretaker_id,)).fetchone()
    if not caretaker:
        raise HTTPException(status_code=404, detail="Caretaker not found")
    rows = conn.execute(
        "SELECT * FROM family_members WHERE caretaker_id = ? ORDER BY COALESCE(sort_order, id), created_at ASC",
        (caretaker_id,),
    ).fetchall()

    return [
        {
            "userId": f"fm:{row['id']}",
            "name": row["name"],
            "age": row["age"],
            "sex": row["sex"],
            "weightKg": row["weight_kg"],
            "conditions": json.loads(row["conditions"]) if row.get("conditions") else [],
            "diet": row.get("dietary_prefs") or "none",
            "allergies": json.loads(row["allergies"]) if row.get("allergies") else [],
        }
        for row in rows
    ]

