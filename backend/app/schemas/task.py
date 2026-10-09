from datetime import date, datetime

from pydantic import BaseModel, Field


class TaskCreate(BaseModel):
    title: str = Field(min_length=1, max_length=200)
    description: str | None = None
    task_type: str = Field(pattern="^(assignment|project|personal)$")
    subject: str | None = None
    priority: str = Field(default="medium", pattern="^(low|medium|high)$")
    due_date: date | None = None


class TaskUpdate(BaseModel):
    title: str | None = Field(default=None, min_length=1, max_length=200)
    description: str | None = None
    task_type: str | None = Field(
        default=None, pattern="^(assignment|project|personal)$"
    )
    subject: str | None = None
    priority: str | None = Field(default=None, pattern="^(low|medium|high)$")
    due_date: date | None = None


class StatusUpdate(BaseModel):
    status: str = Field(pattern="^(todo|in_progress|completed)$")


class TaskResponse(BaseModel):
    id: int
    user_id: int
    title: str
    description: str | None
    task_type: str
    subject: str | None
    priority: str
    status: str
    due_date: date | None
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True
