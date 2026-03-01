from __future__ import annotations

from pydantic import BaseModel, Field


class CreateCaretakerBody(BaseModel):
    name: str = Field(min_length=1)
    authUserId: str | None = None


class UserProfileBody(BaseModel):
    userId: str | None = None
    name: str = "Diner"
    age: int | None = None
    sex: str | None = None
    weightKg: float | None = None
    caretakerId: str | None = None
    conditions: list[str] = Field(default_factory=list)
    diet: str = "none"
    allergies: list[str] = Field(default_factory=list)


class AddMealPlanBody(BaseModel):
    dayIndex: int
    mealType: str
    dishId: str
    servings: float = 1.0
    customIngredients: dict[str, float] | None = None
    weekStart: str | None = None


class ToggleShoppingSelectionBody(BaseModel):
    weekStart: str
    dayIndex: int
    mealType: str


class RequestOtpBody(BaseModel):
    email: str = Field(min_length=3)


class VerifyOtpBody(BaseModel):
    email: str = Field(min_length=3)
    otp: str = Field(min_length=4, max_length=8)


class RegisterBody(BaseModel):
    email: str = Field(min_length=3)
    verificationToken: str = Field(min_length=1)
    password: str = Field(min_length=8)


class LoginBody(BaseModel):
    email: str = Field(min_length=3)
    password: str = Field(min_length=1)
