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


class GenerateMealPlanBody(BaseModel):
    weekStart: str | None = None
    days: int = Field(default=3, ge=1, le=7)
    maxSolutions: int = Field(default=1, ge=1, le=3)


class NutrientThresholdItem(BaseModel):
    nutrientKey: str = Field(min_length=1)
    dailyValue: float | None = None
    perMealValue: float | None = None


class AutofillSettings(BaseModel):
    maxDishesPerSlot: int | dict[str, int] = 2
    maxCalories: float | None = None
    maxCarbs: float | None = None
    maxFat: float | None = None
    mealCalorieRatio: dict[str, float] | None = None


class AutofillBody(BaseModel):
    weekStart: str | None = None
    settings: AutofillSettings = Field(default_factory=AutofillSettings)
    thresholds: list[NutrientThresholdItem] = Field(default_factory=list)
    allowConstraintRelaxation: bool = False


class AutofillConstraintViolation(BaseModel):
    code: str = Field(min_length=1)
    title: str = Field(min_length=1)
    message: str = Field(min_length=1)
    dayIndex: int
    mealType: str | None = None
    recipeIds: list[str] = Field(default_factory=list)
    actual: float | None = None
    limit: float | None = None


class AutofillValidationResponse(BaseModel):
    success: bool = True
    canProceed: bool
    violations: list[AutofillConstraintViolation] = Field(default_factory=list)


class ToggleShoppingSelectionBody(BaseModel):
    weekStart: str
    dayIndex: int
    mealType: str


class ShoppingSelectionItem(BaseModel):
    dayIndex: int
    mealType: str


class SetShoppingSelectionsBody(BaseModel):
    weekStart: str
    selections: list[ShoppingSelectionItem]


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


class SaveThresholdsBody(BaseModel):
    thresholds: list[NutrientThresholdItem]


class UpdateTierBody(BaseModel):
    tier: str = Field(pattern=r"^(free|paid)$")


class GeneratePlanBody(BaseModel):
    weekStart: str | None = None
    numDays: int = 7
    timeLimitSeconds: int = 10
    dayIndex: int | None = None  # generate for a single day only
    maxDishesPerSlot: int | dict[str, int] = 1
    nutrientLimits: dict[str, float] | None = None  # user-set daily limits
