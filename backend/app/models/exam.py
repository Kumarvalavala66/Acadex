from datetime import date, datetime

from sqlalchemy import Date, DateTime, Integer, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base


class ExamSchedule(Base):
    __tablename__ = "exam_schedules"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)

    subject: Mapped[str] = mapped_column(String(100), nullable=False)

    exam_name: Mapped[str] = mapped_column(String(100), nullable=False)

    exam_type: Mapped[str] = mapped_column(String(30), nullable=False)

    exam_date: Mapped[date | None] = mapped_column(Date, nullable=True)

    is_tentative: Mapped[bool] = mapped_column(default=False, nullable=False)

    max_marks: Mapped[int | None] = mapped_column(Integer, nullable=True)

    notes: Mapped[str | None] = mapped_column(Text, nullable=True)

    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)

    updated_at: Mapped[datetime] = mapped_column(
        DateTime, default=datetime.utcnow, onupdate=datetime.utcnow
    )

    results = relationship(
        "ExamResult", back_populates="exam", cascade="all, delete-orphan"
    )
