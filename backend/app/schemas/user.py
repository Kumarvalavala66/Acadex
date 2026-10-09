from pydantic import BaseModel


class UserCreate(BaseModel):
    name: str
    username: str
    password: str


class UserLogin(BaseModel):
    username: str
    password: str


class UserResponse(BaseModel):
    id: int
    name: str
    username: str

    model_config = {"from_attributes": True}
