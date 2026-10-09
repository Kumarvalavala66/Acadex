from datetime import date, datetime

from sqlalchemy import Date, DateTime, ForeignKey, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base


class Task(Base):
    __tablename__ = "tasks"

    id: Mapped[int] = mapped_column(
        primary_key=True,
        index=True
    )

    user_id: Mapped[int] = mapped_column(
        ForeignKey("users.id")
    )

    title: Mapped[str] = mapped_column(
        String(200)
    )

    description: Mapped[str | None] = mapped_column(
        Text,
        nullable=True
    )

    task_type: Mapped[str] = mapped_column(
        String(30)
    )

    subject: Mapped[str | None] = mapped_column(
        String(100),
        nullable=True
    )

    priority: Mapped[str] = mapped_column(
        String(20),
        default="medium"
    )

    status: Mapped[str] = mapped_column(
        String(20),
        default="todo"
    )

    due_date: Mapped[date | None] = mapped_column(
        Date,
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
        back_populates="tasks"
    )
