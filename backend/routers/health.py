from fastapi import APIRouter

from ..utils import iso_now

router = APIRouter(prefix="/health", tags=["health"])


@router.get("")
def health() -> dict[str, str]:
    return {"status": "ok", "timestamp": iso_now()}
