from __future__ import annotations

import os
from functools import lru_cache
from pathlib import Path

_PROJECT_ROOT = Path(__file__).resolve().parent.parent
_CONFIG_PATH = _PROJECT_ROOT / ".env"


def _parse_properties(text: str) -> dict[str, str]:
    values: dict[str, str] = {}
    for raw_line in text.splitlines():
        line = raw_line.strip()
        if not line or line.startswith("#"):
            continue
        if "=" not in line:
            continue
        key, value = line.split("=", 1)
        values[key.strip()] = value.strip()
    return values


@lru_cache(maxsize=1)
def load_properties() -> dict[str, str]:
    if not _CONFIG_PATH.exists():
        return {}
    return _parse_properties(_CONFIG_PATH.read_text(encoding="utf-8"))


def get_setting(key: str, default: str | None = None) -> str | None:
    env_value = os.getenv(key)
    if env_value is not None and env_value != "":
        return env_value

    file_value = load_properties().get(key)
    if file_value is not None and file_value != "":
        return file_value

    return default


def get_int_setting(key: str, default: int) -> int:
    value = get_setting(key)
    if value is None:
        return default
    try:
        return int(value)
    except ValueError:
        return default
