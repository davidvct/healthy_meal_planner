from collections.abc import AsyncGenerator

import sqlalchemy.ext.asyncio
from sqlalchemy.exc import SQLAlchemyError
from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker

from example.settings import SETTINGS

async_engine = sqlalchemy.ext.asyncio.create_async_engine(url=SETTINGS.database_url)
async_session_factory = async_sessionmaker(async_engine)


async def get_session() -> AsyncGenerator[AsyncSession]:
    async_session = async_session_factory()
    try:
        yield async_session
        await async_session.commit()
    except SQLAlchemyError:
        await async_session.rollback()
        raise
    finally:
        await async_session.close()


async def close_engine() -> None:
    await async_engine.dispose()
