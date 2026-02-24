import contextlib
from collections.abc import AsyncGenerator

from fastapi import FastAPI

import example.db
import example.routers.meals
from example.models.base import Base


@contextlib.asynccontextmanager
async def lifespan(_: FastAPI) -> AsyncGenerator[None]:
    async with example.db.async_engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    yield
    await example.db.close_engine()


app = FastAPI(lifespan=lifespan)
app.include_router(example.routers.meals.router)


@app.get("/")
async def index():
    return {"LoMaiG.ai"}
