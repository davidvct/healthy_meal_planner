import sqlalchemy
from sqlalchemy.ext.asyncio import AsyncSession

from example.models.meals import Meal as MealModel
from example.schemas.meals import Meal as MealSchema


async def list_meals(session: AsyncSession) -> list[MealSchema]:
    result = await session.execute(sqlalchemy.select(MealModel))
    models = result.scalars().all()
    return [MealSchema.model_validate(model) for model in models]
