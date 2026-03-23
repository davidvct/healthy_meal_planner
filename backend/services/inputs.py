"""Backward-compatible re-exports — input loading lives in services/solver/inputs.py."""
from __future__ import annotations

from .solver.inputs import load_solver_inputs_from_db  # noqa: F401
