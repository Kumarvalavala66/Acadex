from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routers.learning import router as learning_router
from app.database import Base, engine
from app.models import User, Task, ExamSchedule, ExamResult
from app.routers.holidays import router as holidays_router
from app.routers.auth import router as auth_router
from app.routers.tasks import router as tasks_router
from app.routers.exams import router as exams_router
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

# Create database tables
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="Student Academic & Work Organizer",
    version="1.0.0",
)


# ==================== CORS ====================
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:5174",
        "http://127.0.0.1:5174",
        "https://acadexedu.netlify.app",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ==================== ROUTERS ====================
app.include_router(holidays_router)
app.include_router(auth_router)
app.include_router(tasks_router)
app.include_router(exams_router)
app.include_router(learning_router)


@app.get("/")
def root():
    return {
        "message": "Student Organizer API is running",
    }
