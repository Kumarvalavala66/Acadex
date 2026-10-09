# Add these imports to the top of app/routers/auth.py:
from pydantic import BaseModel, Field

# Add these schemas near the router definition:
class ProfileUpdate(BaseModel):
    name: str = Field(min_length=1, max_length=100)
    username: str = Field(min_length=1, max_length=50)

class PasswordChange(BaseModel):
    current_password: str = Field(min_length=1)
    new_password: str = Field(min_length=6, max_length=128)

# Add these endpoints to app/routers/auth.py:

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
