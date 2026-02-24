from pydantic import Field
from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    database_url: str = Field(default="sqlite+aiosqlite:///./example/example.db")


SETTINGS = Settings()
