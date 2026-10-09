from datetime import date, datetime

from sqlalchemy import Date, DateTime, ForeignKey, Integer, String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base


class LearningTask(Base):
    __tablename__ = "learning_tasks"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)

    user_id: Mapped[int] = mapped_column(
        ForeignKey("users.id"),
        nullable=False,
        index=True
    )

    title: Mapped[str] = mapped_column(
        String(200),
        nullable=False
    )

    subject: Mapped[str | None] = mapped_column(
        String(100),
        nullable=True
    )

    priority: Mapped[str] = mapped_column(
        String(20),
        default="medium",
        nullable=False
    )

    status: Mapped[str] = mapped_column(
        String(20),
        default="todo",
        nullable=False
    )

    due_date: Mapped[date | None] = mapped_column(
        Date,
        nullable=True
    )

    estimated_minutes: Mapped[int | None] = mapped_column(
        Integer,
        nullable=True
    )

    created_at: Mapped[datetime] = mapped_column(
        DateTime,
        default=datetime.utcnow
    )

    updated_at: Mapped[datetime] = mapped_column(
        DateTime,
        default=datetime.utcnow,
        onupdate=datetime.utcnow
    )

    user = relationship(
        "User",
        back_populates="learning_tasks"
    )
