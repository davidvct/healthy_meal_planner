from pydantic import Field
from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    database_url: str = Field(default="postgresql://postgres:postgres@localhost:5432/healthy_meal_planner")


SETTINGS = Settings()

