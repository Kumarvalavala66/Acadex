from datetime import date, datetime
from typing import Literal

from pydantic import BaseModel, Field


class LearningTaskCreate(BaseModel):
    title: str
    subject: str | None = None
    priority: Literal["low", "medium", "high"] = "medium"
    status: Literal["todo", "in_progress", "completed"] = "todo"
    due_date: date | None = None
    estimated_minutes: int | None = Field(
        default=None,
        ge=1
    )


class LearningTaskUpdate(BaseModel):
    title: str | None = None
    subject: str | None = None
    priority: Literal["low", "medium", "high"] | None = None
    status: Literal["todo", "in_progress", "completed"] | None = None
    due_date: date | None = None
    estimated_minutes: int | None = Field(
        default=None,
        ge=1
    )


class LearningTaskResponse(BaseModel):
    id: int
    user_id: int
    title: str
    subject: str | None
    priority: str
    status: str
    due_date: date | None
    estimated_minutes: int | None
    created_at: datetime
    updated_at: datetime

    model_config = {
        "from_attributes": True
    }
