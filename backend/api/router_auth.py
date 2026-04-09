"""
Auth router — /api/auth/*

Routes
------
POST  /api/auth/signup          — register
POST  /api/auth/login           — login → JWT
GET   /api/auth/me              — current user
PATCH /api/auth/me              — update name / email
POST  /api/auth/change-password — change password
POST  /api/auth/forgot-password — request reset (stub)
DELETE /api/auth/me             — delete account + all data
"""

from __future__ import annotations
from datetime import datetime
from typing import Optional

from fastapi import APIRouter, HTTPException, Depends, status
from pydantic import BaseModel, Field

from backend.database.repositories import UserRepository, ProjectRepository, ArtifactRepository
from backend.auth import (
    hash_password,
    verify_password,
    create_access_token,
    get_current_user_id,
)

router = APIRouter(prefix="/api/auth", tags=["Auth"])
user_repo = UserRepository()
project_repo = ProjectRepository()
artifact_repo = ArtifactRepository()


# ── Schemas ──────────────────────────────────────────────────────────

class SignupBody(BaseModel):
    name: str       = Field(..., min_length=2, max_length=100)
    email: str
    password: str   = Field(..., min_length=6)

class LoginBody(BaseModel):
    email: str
    password: str

class UpdateMeBody(BaseModel):
    name: Optional[str] = Field(None, min_length=2, max_length=100)

class ChangePasswordBody(BaseModel):
    current_password: str
    new_password: str = Field(..., min_length=6)

class ForgotPasswordBody(BaseModel):
    email: str


# ── Helpers ───────────────────────────────────────────────────────────

def _safe(user: dict) -> dict:
    return {k: v for k, v in user.items() if k not in ("password_hash",)}


# ── Routes ────────────────────────────────────────────────────────────

@router.post("/signup", status_code=201, summary="Register new account")
def signup(body: SignupBody):
    if user_repo.email_exists(body.email):
        raise HTTPException(status.HTTP_409_CONFLICT, "Email already registered.")
    user = user_repo.create(
        name=body.name,
        email=body.email,
        password_hash=hash_password(body.password),
    )
    token = create_access_token({"sub": user["id"]})
    return {"user": _safe(user), "access_token": token, "token_type": "bearer"}


@router.post("/login", summary="Login and receive JWT")
def login(body: LoginBody):
    user = user_repo.get_by_email(body.email)
    if not user or not verify_password(body.password, user["password_hash"]):
        raise HTTPException(status.HTTP_401_UNAUTHORIZED, "Invalid email or password.")
    if not user.get("is_active"):
        raise HTTPException(status.HTTP_403_FORBIDDEN, "Account is disabled.")
    user_repo.update_last_login(user["id"])
    token = create_access_token({"sub": user["id"]})
    return {"user": _safe(user), "access_token": token, "token_type": "bearer"}


@router.get("/me", summary="Get current user profile")
def get_me(user_id: str = Depends(get_current_user_id)):
    user = user_repo.get_by_id(user_id)
    if not user:
        raise HTTPException(404, "User not found.")
    return _safe(user)


@router.patch("/me", summary="Update name or email")
def update_me(body: UpdateMeBody, user_id: str = Depends(get_current_user_id)):
    fields = {k: v for k, v in body.dict().items() if v is not None}
    if not fields:
        raise HTTPException(400, "No fields provided.")
    # Check email uniqueness if changing email
    if "email" in fields:
        existing = user_repo.get_by_email(fields["email"])
        if existing and existing["id"] != user_id:
            raise HTTPException(409, "Email already in use.")
    updated = user_repo.update(user_id, fields)
    return _safe(updated)


@router.post("/change-password", summary="Change password")
def change_password(body: ChangePasswordBody, user_id: str = Depends(get_current_user_id)):
    user = user_repo.get_by_id(user_id)
    if not verify_password(body.current_password, user["password_hash"]):
        raise HTTPException(400, "Current password is incorrect.")
    user_repo.update(user_id, {"password_hash": hash_password(body.new_password)})
    return {"message": "Password updated successfully."}


@router.post("/forgot-password", summary="Request password reset link (stub)")
def forgot_password(body: ForgotPasswordBody):
    # Production: generate a token, email it to the user
    # Here we just confirm the email exists without revealing info
    return {"message": "If that email exists, a reset link has been sent."}


@router.delete("/me", status_code=204, summary="Delete account and all data")
def delete_account(user_id: str = Depends(get_current_user_id)):
    """
    Permanently delete user account, all projects, and all artifacts.
    Returns 204 No Content on success.
    """
    # Get all projects for this user
    projects = project_repo.get_by_user(user_id, skip=0, limit=1000)
    
    # Delete all artifacts for each project
    for project in projects:
        artifact_repo.delete_by_project(project["id"])
    
    # Delete all projects for this user
    for project in projects:
        project_repo.delete(project["id"])
    
    # Delete the user
    user_repo.delete(user_id)
    
    # Return 204 (no content) on success
    return

