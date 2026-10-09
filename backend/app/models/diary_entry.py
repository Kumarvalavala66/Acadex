from datetime import date, datetime

from sqlalchemy import Date, DateTime, ForeignKey, Integer, Text, UniqueConstraint
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base


class DiaryEntry(Base):
    __tablename__ = "diary_entries"

    __table_args__ = (
        UniqueConstraint(
            "user_id",
            "entry_date",
            name="uq_user_diary_date"
        ),
    )

    id: Mapped[int] = mapped_column(primary_key=True, index=True)

    user_id: Mapped[int] = mapped_column(
        ForeignKey("users.id"),
        nullable=False,
        index=True
    )

    entry_date: Mapped[date] = mapped_column(
        Date,
        nullable=False
    )

    studied: Mapped[str] = mapped_column(
        Text,
        nullable=False
    )

    completed: Mapped[str | None] = mapped_column(
        Text,
        nullable=True
    )

    difficulties: Mapped[str | None] = mapped_column(
        Text,
        nullable=True
    )

    tomorrow_plan: Mapped[str | None] = mapped_column(
        Text,
        nullable=True
    )

    progress: Mapped[int] = mapped_column(
        Integer,
        default=0,
        nullable=False
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
        back_populates="diary_entries"
    )
