from datetime import date, datetime

from pydantic import BaseModel, Field


class DiaryEntryCreate(BaseModel):
    entry_date: date
    studied: str
    completed: str | None = None
    difficulties: str | None = None
    tomorrow_plan: str | None = None
    progress: int = Field(
        default=0,
        ge=0,
        le=100
    )


class DiaryEntryUpdate(BaseModel):
    entry_date: date | None = None
    studied: str | None = None
    completed: str | None = None
    difficulties: str | None = None
    tomorrow_plan: str | None = None
    progress: int | None = Field(
        default=None,
        ge=0,
        le=100
    )


class DiaryEntryResponse(BaseModel):
    id: int
    user_id: int
    entry_date: date
    studied: str
    completed: str | None
    difficulties: str | None
    tomorrow_plan: str | None
    progress: int
    created_at: datetime
    updated_at: datetime

    model_config = {
        "from_attributes": True
    }
