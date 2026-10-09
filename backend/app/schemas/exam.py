from datetime import date, datetime

from pydantic import BaseModel, Field


class ExamScheduleResponse(BaseModel):
    id: int
    subject: str
    exam_name: str
    exam_type: str
    exam_date: date | None
    is_tentative: bool
    max_marks: int | None
    notes: str | None
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}


class ExamResultCreate(BaseModel):
    exam_id: int
    marks_obtained: int = Field(ge=0)
    notes: str | None = None


class ExamResultUpdate(BaseModel):
    marks_obtained: int | None = Field(default=None, ge=0)

    notes: str | None = None


class ExamResultResponse(BaseModel):
    id: int
    user_id: int
    exam_id: int
    marks_obtained: int
    notes: str | None
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}
