from datetime import date, timedelta

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.diary_entry import DiaryEntry
from app.models.learning_task import LearningTask
from app.models.user import User
from app.schemas.diary import (
    DiaryEntryCreate,
    DiaryEntryResponse,
    DiaryEntryUpdate,
)
from app.schemas.learning import (
    LearningTaskCreate,
    LearningTaskResponse,
    LearningTaskUpdate,
)
from app.security import get_current_user

router = APIRouter(prefix="/learning", tags=["Learning"])


# ============================================================
# LEARNING TASKS
# ============================================================


@router.get("/tasks", response_model=list[LearningTaskResponse])
def get_learning_tasks(
    db: Session = Depends(get_db), current_user: User = Depends(get_current_user)
):
    return (
        db.query(LearningTask)
        .filter(LearningTask.user_id == current_user.id)
        .order_by(
            LearningTask.due_date.is_(None),
            LearningTask.due_date,
            LearningTask.created_at.desc(),
        )
        .all()
    )


@router.post("/tasks", response_model=LearningTaskResponse, status_code=201)
def create_learning_task(
    task_data: LearningTaskCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    task = LearningTask(
        user_id=current_user.id,
        title=task_data.title,
        subject=task_data.subject,
        priority=task_data.priority,
        status=task_data.status,
        due_date=task_data.due_date,
        estimated_minutes=task_data.estimated_minutes,
    )

    db.add(task)
    db.commit()
    db.refresh(task)

    return task


@router.put("/tasks/{task_id}", response_model=LearningTaskResponse)
def update_learning_task(
    task_id: int,
    task_data: LearningTaskUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    task = (
        db.query(LearningTask)
        .filter(LearningTask.id == task_id, LearningTask.user_id == current_user.id)
        .first()
    )

    if task is None:
        raise HTTPException(status_code=404, detail="Learning task not found")

    update_data = task_data.model_dump(exclude_unset=True)

    for field, value in update_data.items():
        setattr(task, field, value)

    db.commit()
    db.refresh(task)

    return task


@router.delete("/tasks/{task_id}")
def delete_learning_task(
    task_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    task = (
        db.query(LearningTask)
        .filter(LearningTask.id == task_id, LearningTask.user_id == current_user.id)
        .first()
    )

    if task is None:
        raise HTTPException(status_code=404, detail="Learning task not found")

    db.delete(task)
    db.commit()

    return {"message": "Learning task deleted successfully"}


# ============================================================
# LEARNING DIARY
# ============================================================


@router.get("/diary", response_model=list[DiaryEntryResponse])
def get_diary_entries(
    db: Session = Depends(get_db), current_user: User = Depends(get_current_user)
):
    return (
        db.query(DiaryEntry)
        .filter(DiaryEntry.user_id == current_user.id)
        .order_by(DiaryEntry.entry_date.desc())
        .all()
    )


@router.post("/diary", response_model=DiaryEntryResponse, status_code=201)
def create_diary_entry(
    entry_data: DiaryEntryCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    existing_entry = (
        db.query(DiaryEntry)
        .filter(
            DiaryEntry.user_id == current_user.id,
            DiaryEntry.entry_date == entry_data.entry_date,
        )
        .first()
    )

    if existing_entry:
        raise HTTPException(
            status_code=400, detail="A diary entry already exists for this date"
        )

    entry = DiaryEntry(
        user_id=current_user.id,
        entry_date=entry_data.entry_date,
        studied=entry_data.studied,
        completed=entry_data.completed,
        difficulties=entry_data.difficulties,
        tomorrow_plan=entry_data.tomorrow_plan,
        progress=entry_data.progress,
    )

    db.add(entry)
    db.commit()
    db.refresh(entry)

    return entry


@router.put("/diary/{entry_id}", response_model=DiaryEntryResponse)
def update_diary_entry(
    entry_id: int,
    entry_data: DiaryEntryUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    entry = (
        db.query(DiaryEntry)
        .filter(DiaryEntry.id == entry_id, DiaryEntry.user_id == current_user.id)
        .first()
    )

    if entry is None:
        raise HTTPException(status_code=404, detail="Diary entry not found")

    update_data = entry_data.model_dump(exclude_unset=True)

    if "entry_date" in update_data:
        duplicate = (
            db.query(DiaryEntry)
            .filter(
                DiaryEntry.user_id == current_user.id,
                DiaryEntry.entry_date == update_data["entry_date"],
                DiaryEntry.id != entry_id,
            )
            .first()
        )

        if duplicate:
            raise HTTPException(
                status_code=400, detail="A diary entry already exists for this date"
            )

    for field, value in update_data.items():
        setattr(entry, field, value)

    db.commit()
    db.refresh(entry)

    return entry


@router.delete("/diary/{entry_id}")
def delete_diary_entry(
    entry_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    entry = (
        db.query(DiaryEntry)
        .filter(DiaryEntry.id == entry_id, DiaryEntry.user_id == current_user.id)
        .first()
    )

    if entry is None:
        raise HTTPException(status_code=404, detail="Diary entry not found")

    db.delete(entry)
    db.commit()

    return {"message": "Diary entry deleted successfully"}


# ============================================================
# LEARNING PROGRESS
# ============================================================


@router.get("/progress")
def get_learning_progress(
    db: Session = Depends(get_db), current_user: User = Depends(get_current_user)
):
    today = date.today()

    # Monday = start of current week
    week_start = today - timedelta(days=today.weekday())
    week_end = week_start + timedelta(days=6)

    all_tasks = (
        db.query(LearningTask).filter(LearningTask.user_id == current_user.id).all()
    )

    # ----------------------------
    # Today
    # ----------------------------

    today_tasks = [task for task in all_tasks if task.due_date == today]

    today_total = len(today_tasks)

    today_completed = sum(1 for task in today_tasks if task.status == "completed")

    today_remaining = today_total - today_completed

    today_percent = (
        round((today_completed / today_total) * 100) if today_total > 0 else 0
    )

    # ----------------------------
    # Current week
    # ----------------------------

    week_tasks = [
        task
        for task in all_tasks
        if task.due_date is not None and week_start <= task.due_date <= week_end
    ]

    week_total = len(week_tasks)

    week_completed = sum(1 for task in week_tasks if task.status == "completed")

    week_percent = round((week_completed / week_total) * 100) if week_total > 0 else 0

    # ----------------------------
    # Subject breakdown
    # ----------------------------

    subjects = {}

    for task in all_tasks:
        subject = task.subject or "Other"

        if subject not in subjects:
            subjects[subject] = {
                "subject": subject,
                "total": 0,
                "completed": 0,
            }

        subjects[subject]["total"] += 1

        if task.status == "completed":
            subjects[subject]["completed"] += 1

    subject_breakdown = list(subjects.values())

    for item in subject_breakdown:
        item["completion_percent"] = (
            round(item["completed"] / item["total"] * 100) if item["total"] > 0 else 0
        )

    # ----------------------------
    # Recent diary entries
    # ----------------------------

    recent_diary = (
        db.query(DiaryEntry)
        .filter(DiaryEntry.user_id == current_user.id)
        .order_by(DiaryEntry.entry_date.desc())
        .limit(7)
        .all()
    )

    diary_data = [
        {
            "id": entry.id,
            "entry_date": entry.entry_date,
            "progress": entry.progress,
            "studied": entry.studied,
        }
        for entry in recent_diary
    ]

    return {
        "today": {
            "date": today,
            "total": today_total,
            "completed": today_completed,
            "remaining": today_remaining,
            "completion_percent": today_percent,
        },
        "week": {
            "start": week_start,
            "end": week_end,
            "total": week_total,
            "completed": week_completed,
            "completion_percent": week_percent,
        },
        "subject_breakdown": subject_breakdown,
        "recent_diary": diary_data,
    }
