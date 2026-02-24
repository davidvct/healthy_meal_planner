from typing import Annotated

from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

import example.db
import example.services.meals
from example.schemas.meals import Meal

router = APIRouter(prefix="/meals")


@router.get("/")
async def get_meals(
    session: Annotated[AsyncSession, Depends(example.db.get_session)],
) -> list[Meal]:
    return await example.services.meals.list_meals(session)
