from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.exam import ExamSchedule
from app.models.exam_result import ExamResult
from app.models.user import User
from app.schemas.exam import (
    ExamScheduleResponse,
    ExamResultCreate,
    ExamResultUpdate,
    ExamResultResponse,
)
from app.security import get_current_user

router = APIRouter(prefix="/exams", tags=["Exams"])


# --------------------------------------------------
# OFFICIAL EXAM SCHEDULE
# --------------------------------------------------


@router.get("/schedule", response_model=list[ExamScheduleResponse])
def get_exam_schedule(
    db: Session = Depends(get_db), current_user: User = Depends(get_current_user)
):
    return db.query(ExamSchedule).order_by(ExamSchedule.exam_date).all()


# --------------------------------------------------
# STUDENT RESULTS
# --------------------------------------------------


@router.get("/results", response_model=list[ExamResultResponse])
def get_my_results(
    db: Session = Depends(get_db), current_user: User = Depends(get_current_user)
):
    return (
        db.query(ExamResult)
        .filter(ExamResult.user_id == current_user.id)
        .order_by(ExamResult.exam_id)
        .all()
    )


@router.post("/results", response_model=ExamResultResponse)
def create_result(
    result_data: ExamResultCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    exam = db.query(ExamSchedule).filter(ExamSchedule.id == result_data.exam_id).first()

    if exam is None:
        raise HTTPException(status_code=404, detail="Exam not found")

    if exam.max_marks is not None and result_data.marks_obtained > exam.max_marks:
        raise HTTPException(
            status_code=400, detail="Marks obtained cannot exceed maximum marks"
        )

    existing_result = (
        db.query(ExamResult)
        .filter(
            ExamResult.user_id == current_user.id,
            ExamResult.exam_id == result_data.exam_id,
        )
        .first()
    )

    if existing_result:
        raise HTTPException(
            status_code=400, detail="Result already exists for this exam"
        )

    result = ExamResult(
        user_id=current_user.id,
        exam_id=result_data.exam_id,
        marks_obtained=result_data.marks_obtained,
        notes=result_data.notes,
    )

    db.add(result)
    db.commit()
    db.refresh(result)

    return result


@router.put("/results/{result_id}", response_model=ExamResultResponse)
def update_result(
    result_id: int,
    result_data: ExamResultUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    result = (
        db.query(ExamResult)
        .filter(ExamResult.id == result_id, ExamResult.user_id == current_user.id)
        .first()
    )

    if result is None:
        raise HTTPException(status_code=404, detail="Result not found")

    if result_data.marks_obtained is not None:
        exam = db.query(ExamSchedule).filter(ExamSchedule.id == result.exam_id).first()

        if (
            exam
            and exam.max_marks is not None
            and result_data.marks_obtained > exam.max_marks
        ):
            raise HTTPException(
                status_code=400, detail="Marks obtained cannot exceed maximum marks"
            )

    update_data = result_data.model_dump(exclude_unset=True)

    for field, value in update_data.items():
        setattr(result, field, value)

    db.commit()
    db.refresh(result)

    return result


@router.delete("/results/{result_id}")
def delete_result(
    result_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    result = (
        db.query(ExamResult)
        .filter(ExamResult.id == result_id, ExamResult.user_id == current_user.id)
        .first()
    )

    if result is None:
        raise HTTPException(status_code=404, detail="Result not found")

    db.delete(result)
    db.commit()

    return {"message": "Result deleted successfully"}
