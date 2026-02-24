from sqlalchemy.orm import Mapped, mapped_column

from example.models.base import Base


class Meal(Base):
    __tablename__ = "meal"

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    name: Mapped[str] = mapped_column(nullable=False)
    calories: Mapped[int] = mapped_column(nullable=False)
