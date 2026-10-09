from datetime import datetime

from sqlalchemy import DateTime, ForeignKey, Integer, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base


class ExamResult(Base):
    __tablename__ = "exam_results"

    id: Mapped[int] = mapped_column(
        primary_key=True,
        index=True
    )

    user_id: Mapped[int] = mapped_column(
        ForeignKey("users.id"),
        nullable=False,
        index=True
    )

    exam_id: Mapped[int] = mapped_column(
        ForeignKey("exam_schedules.id"),
        nullable=False,
        index=True
    )

    marks_obtained: Mapped[int] = mapped_column(
        Integer,
        nullable=False
    )

    notes: Mapped[str | None] = mapped_column(
        Text,
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
        back_populates="exam_results"
    )

    exam = relationship(
        "ExamSchedule",
        back_populates="results"
    )
