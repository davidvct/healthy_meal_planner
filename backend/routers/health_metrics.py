from __future__ import annotations

from datetime import date, time
from typing import Optional

from fastapi import APIRouter, Depends
from pydantic import BaseModel

from ..db import DBConnection, get_db

router = APIRouter(prefix="/health-metrics", tags=["health-metrics"])


class HealthMetricIn(BaseModel):
    date: date
    measurement_time: Optional[str] = None
    blood_sugar: Optional[float] = None
    systolic_bp: Optional[float] = None
    diastolic_bp: Optional[float] = None
    total_cholesterol: Optional[float] = None
    ldl: Optional[float] = None
    hdl: Optional[float] = None
    triglycerides: Optional[float] = None
    notes: Optional[str] = None


@router.post("/{user_id}")
def create_health_metric(user_id: str, body: HealthMetricIn, conn: DBConnection = Depends(get_db)):
    cur = conn.execute(
        """
        INSERT INTO health_metrics
            (user_id, date, measurement_time, blood_sugar, systolic_bp, diastolic_bp,
             total_cholesterol, ldl, hdl, triglycerides, notes)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        RETURNING id, user_id, date, measurement_time, blood_sugar, systolic_bp, diastolic_bp,
                  total_cholesterol, ldl, hdl, triglycerides, notes, created_at
        """,
        (
            user_id,
            body.date,
            body.measurement_time,
            body.blood_sugar,
            body.systolic_bp,
            body.diastolic_bp,
            body.total_cholesterol,
            body.ldl,
            body.hdl,
            body.triglycerides,
            body.notes,
        ),
    )
    conn.commit()
    row = cur.fetchone()
    return _row_to_dict(row)


@router.get("/{user_id}")
def list_health_metrics(
    user_id: str,
    date_from: Optional[str] = None,
    date_to: Optional[str] = None,
    conn: DBConnection = Depends(get_db),
):
    if date_from and date_to:
        rows = conn.execute(
            """
            SELECT id, user_id, date, measurement_time, blood_sugar, systolic_bp, diastolic_bp,
                   total_cholesterol, ldl, hdl, triglycerides, notes, created_at
            FROM health_metrics
            WHERE user_id = ? AND date >= ?::date AND date <= ?::date
            ORDER BY date ASC, measurement_time ASC NULLS LAST
            """,
            (user_id, date_from, date_to),
        ).fetchall()
    else:
        rows = conn.execute(
            """
            SELECT id, user_id, date, measurement_time, blood_sugar, systolic_bp, diastolic_bp,
                   total_cholesterol, ldl, hdl, triglycerides, notes, created_at
            FROM health_metrics
            WHERE user_id = ?
            ORDER BY date ASC, measurement_time ASC NULLS LAST
            """,
            (user_id,),
        ).fetchall()
    return [_row_to_dict(r) for r in rows]


@router.delete("/{user_id}/{entry_id}")
def delete_health_metric(user_id: str, entry_id: int, conn: DBConnection = Depends(get_db)):
    conn.execute(
        "DELETE FROM health_metrics WHERE id = ? AND user_id = ?",
        (entry_id, user_id),
    )
    conn.commit()
    return {"deleted": True}


def _row_to_dict(row: dict) -> dict:
    d = dict(row)
    for key in ("date", "measurement_time", "created_at"):
        if key in d and d[key] is not None:
            d[key] = str(d[key])
    return d
