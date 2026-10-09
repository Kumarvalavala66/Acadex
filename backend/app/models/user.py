from sqlalchemy import String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base


class User(Base):
    __tablename__ = "users"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)

    name: Mapped[str] = mapped_column(String(100))

    username: Mapped[str] = mapped_column(String(50), unique=True, index=True)

    password_hash: Mapped[str] = mapped_column(String(255))

    tasks = relationship("Task", back_populates="user", cascade="all, delete-orphan")

    exam_results = relationship(
        "ExamResult", back_populates="user", cascade="all, delete-orphan"
    )
    learning_tasks = relationship(
        "LearningTask", back_populates="user", cascade="all, delete-orphan"
    )

    diary_entries = relationship(
        "DiaryEntry", back_populates="user", cascade="all, delete-orphan"
    )
