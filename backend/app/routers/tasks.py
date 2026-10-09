from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database import get_db

from app.models.task import Task
from app.models.user import User

from app.schemas.task import TaskCreate, TaskUpdate, StatusUpdate, TaskResponse

from app.security import get_current_user

router = APIRouter(prefix="/tasks", tags=["Tasks"])


@router.post("/", response_model=TaskResponse)
def create_task(
    task_data: TaskCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):

    task = Task(
        user_id=current_user.id,
        title=task_data.title,
        description=task_data.description,
        task_type=task_data.task_type,
        subject=task_data.subject,
        priority=task_data.priority,
        due_date=task_data.due_date,
    )

    db.add(task)
    db.commit()
    db.refresh(task)

    return task


@router.get("/", response_model=list[TaskResponse])
def get_tasks(
    db: Session = Depends(get_db), current_user: User = Depends(get_current_user)
):

    tasks = (
        db.query(Task)
        .filter(Task.user_id == current_user.id)
        .order_by(Task.due_date)
        .all()
    )

    return tasks


@router.get("/{task_id}", response_model=TaskResponse)
def get_task(
    task_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):

    task = (
        db.query(Task)
        .filter(Task.id == task_id, Task.user_id == current_user.id)
        .first()
    )

    if task is None:

        raise HTTPException(status_code=404, detail="Task not found")

    return task


@router.put("/{task_id}", response_model=TaskResponse)
def update_task(
    task_id: int,
    task_data: TaskUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):

    task = (
        db.query(Task)
        .filter(Task.id == task_id, Task.user_id == current_user.id)
        .first()
    )

    if task is None:

        raise HTTPException(status_code=404, detail="Task not found")

    update_data = task_data.model_dump(exclude_unset=True)

    for field, value in update_data.items():

        setattr(task, field, value)

    db.commit()
    db.refresh(task)

    return task


@router.delete("/{task_id}")
def delete_task(
    task_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):

    task = (
        db.query(Task)
        .filter(Task.id == task_id, Task.user_id == current_user.id)
        .first()
    )

    if task is None:

        raise HTTPException(status_code=404, detail="Task not found")

    db.delete(task)
    db.commit()

    return {"message": "Task deleted successfully"}


@router.patch("/{task_id}/status", response_model=TaskResponse)
def update_task_status(
    task_id: int,
    status_data: StatusUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):

    task = (
        db.query(Task)
        .filter(Task.id == task_id, Task.user_id == current_user.id)
        .first()
    )

    if task is None:

        raise HTTPException(status_code=404, detail="Task not found")

    task.status = status_data.status

    db.commit()
    db.refresh(task)

    return task
