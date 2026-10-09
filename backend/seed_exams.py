from datetime import date

from app.database import SessionLocal
from app.models.exam import ExamSchedule


def seed_exams():
    db = SessionLocal()

    try:
        existing = db.query(ExamSchedule).count()

        if existing > 0:
            print("Exam schedule already contains data.")
            return

        exams = [
            ExamSchedule(
                subject="DBMS",
                exam_name="Internal 1",
                exam_type="internal",
                exam_date=date(2026, 10, 20),
                is_tentative=False,
                max_marks=30,
                notes="Department examination"
            ),

            ExamSchedule(
                subject="Python",
                exam_name="Internal 1",
                exam_type="internal",
                exam_date=date(2026, 10, 22),
                is_tentative=False,
                max_marks=30,
                notes="Department examination"
            ),

            ExamSchedule(
                subject="Operating Systems",
                exam_name="Semester Examination",
                exam_type="external",
                exam_date=date(2026, 12, 5),
                is_tentative=True,
                max_marks=100,
                notes="Tentative university schedule"
            ),
        ]

        db.add_all(exams)
        db.commit()

        print("Exam schedule seeded successfully.")

    finally:
        db.close()


if __name__ == "__main__":
    seed_exams()
