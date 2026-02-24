from pydantic import BaseModel
from pydantic import ConfigDict


class Meal(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    name: str
    calories: int
