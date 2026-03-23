import json
import re
from datetime import date, datetime, timedelta
from typing import Any


def get_current_week_start(today: date | None = None) -> str:
    current = today or date.today()
    monday = current - timedelta(days=current.weekday())
    return monday.isoformat()


def parse_json(value: Any, default: Any = None) -> Any:
    if value is None:
        return default
    if isinstance(value, (dict, list)):
        return value
    if isinstance(value, (bytes, bytearray)):
        value = value.decode("utf-8")
    if isinstance(value, str):
        try:
            return json.loads(value)
        except json.JSONDecodeError:
            return default
    return default


def parse_float(value: Any, default: float = 0.0) -> float:
    if value is None:
        return default
    if isinstance(value, (int, float)):
        return float(value)
    text = str(value).strip()
    if not text:
        return default
    cleaned = re.sub(r"[^0-9.\-]", "", text)
    if not cleaned or cleaned == "-":
        return default
    try:
        return float(cleaned)
    except ValueError:
        return default


def parse_ingredients_map(value: Any) -> dict[str, float]:
    parsed = parse_json(value, None)
    if isinstance(parsed, dict):
        return {str(k): float(parse_float(v, 0.0)) for k, v in parsed.items()}

    text = str(value or "").strip()
    if not text:
        return {}

    items: dict[str, float] = {}
    for raw_line in text.replace("\r", "\n").split("\n"):
        line = raw_line.strip().lstrip("-* ").strip()
        if not line:
            continue
        parts = line.split(",", 1)
        name = parts[0].strip().lower()
        if not name:
            continue
        items[name] = items.get(name, 0.0) + 100.0
    return items


def parse_servings_yield(value: Any) -> int:
    """Extract the integer serving count from the ``servings`` column.

    Handles values like ``'12 cookies'``, ``'4 frozen waffles'``, ``'6'``, ``'8 servings'``.
    Returns 1 if the value is None, empty, or contains no digits.
    """
    text = str(value or "").strip()
    if not text:
        return 1
    m = re.search(r"(\d+)", text)
    if m:
        return max(1, int(m.group(1)))
    return 1


def iso_now() -> str:
    return datetime.utcnow().isoformat() + "Z"
