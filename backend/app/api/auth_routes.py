from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

from app.services.auth_service import AuthService

router = APIRouter(prefix="/auth", tags=["Auth"])

auth_service = AuthService()


class LoginRequest(BaseModel):
    email: str
    password: str


class LoginResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    name: str
    role: str


@router.post("/login", response_model=LoginResponse)
def login(payload: LoginRequest):
    user = auth_service.authenticate(payload.email, payload.password)

    if not user:
        raise HTTPException(status_code=401, detail="Identifiants invalides")

    token = auth_service.create_access_token(user)

    return LoginResponse(
        access_token=token,
        name=user["name"],
        role=user["role"],
    )