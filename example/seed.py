"""Run this script once to seed the local SQLite database."""

import asyncio

import sqlalchemy.ext.asyncio
from sqlalchemy.ext.asyncio import async_sessionmaker

from example.models.base import Base
from example.models.meals import Meal

DB_PATH = "example/example.db"
async_engine = sqlalchemy.ext.asyncio.create_async_engine(
    url=f"sqlite+aiosqlite:///{DB_PATH}"
)
async_session_factory = async_sessionmaker(async_engine)

SEED_MEALS = [
    Meal(name="Chicken Rice", calories=450),
    Meal(name="Grilled Salmon", calories=520),
    Meal(name="Caesar Salad", calories=310),
]


async def seed() -> None:
    async with async_engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

    async with async_session_factory() as session:
        session.add_all(SEED_MEALS)
        await session.commit()

    await async_engine.dispose()
    print(f"Seeded {len(SEED_MEALS)} meals.")


if __name__ == "__main__":
    asyncio.run(seed())
