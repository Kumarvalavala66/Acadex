from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel, Field
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.user import User
from app.schemas.user import UserCreate, UserLogin, UserResponse
from app.security import (
    create_access_token,
    get_current_user,
    hash_password,
    verify_password,
)


class ProfileUpdate(BaseModel):
    name: str = Field(min_length=1, max_length=100)
    username: str = Field(min_length=1, max_length=50)


class PasswordChange(BaseModel):
    current_password: str = Field(min_length=1)
    new_password: str = Field(min_length=6, max_length=128)

router = APIRouter(
    prefix="/auth",
    tags=["Authentication"],
)


# ==================== REGISTER ====================


@router.post(
    "/register",
    response_model=UserResponse,
    status_code=status.HTTP_201_CREATED,
)
def register(
    user_data: UserCreate,
    db: Session = Depends(get_db),
):
    existing_user = db.query(User).filter(User.username == user_data.username).first()

    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Username already exists",
        )

    user = User(
        name=user_data.name,
        username=user_data.username,
        password_hash=hash_password(user_data.password),
    )

    db.add(user)
    db.commit()
    db.refresh(user)

    return user


# ==================== LOGIN ====================


@router.post("/login")
def login(
    user_data: UserLogin,
    db: Session = Depends(get_db),
):
    user = db.query(User).filter(User.username == user_data.username).first()

    if user is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid username or password",
        )

    if not verify_password(
        user_data.password,
        user.password_hash,
    ):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid username or password",
        )

    access_token = create_access_token(user.id)

    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": {
            "id": user.id,
            "name": user.name,
            "username": user.username,
        },
    }


# ==================== PROFILE ====================


@router.get("/me", response_model=UserResponse)
def get_profile(current_user: User = Depends(get_current_user)):
    return current_user


@router.put("/me", response_model=UserResponse)
def update_profile(
    profile_data: ProfileUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    existing_user = (
        db.query(User)
        .filter(
            User.username == profile_data.username,
            User.id != current_user.id,
        )
        .first()
    )
    if existing_user:
        raise HTTPException(status_code=400, detail="Username already exists")

    current_user.name = profile_data.name.strip()
    current_user.username = profile_data.username.strip()
    db.commit()
    db.refresh(current_user)
    return current_user


@router.post("/change-password")
def update_password(
    password_data: PasswordChange,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    if not verify_password(password_data.current_password, current_user.password_hash):
        raise HTTPException(status_code=400, detail="Current password is incorrect")

    if verify_password(password_data.new_password, current_user.password_hash):
        raise HTTPException(status_code=400, detail="New password must be different")

    current_user.password_hash = hash_password(password_data.new_password)
    db.commit()
    return {"message": "Password changed successfully"}
