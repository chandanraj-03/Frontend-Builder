"""
User model — maps to the 'users' collection in MongoDB.

Collections schema
------------------
users: {
    _id          : ObjectId
    name         : str
    email        : str  (unique)
    password_hash: str
    role         : "user" | "admin"
    is_active    : bool
    created_at   : datetime
    updated_at   : datetime
    last_login   : datetime | None
}
"""

from __future__ import annotations
from datetime import datetime
from typing import Optional
from pydantic import BaseModel, EmailStr, Field


# ── Request schemas ──────────────────────────────────────────────────

class UserCreate(BaseModel):
    """Payload for POST /api/auth/signup."""
    name: str = Field(..., min_length=2, max_length=100)
    email: EmailStr
    password: str = Field(..., min_length=6)


class UserLogin(BaseModel):
    """Payload for POST /api/auth/login."""
    email: EmailStr
    password: str


class UserUpdateProfile(BaseModel):
    """Payload for PATCH /api/users/me."""
    name: Optional[str] = Field(None, min_length=2, max_length=100)
    email: Optional[EmailStr] = None


# ── Response schemas ─────────────────────────────────────────────────

class UserResponse(BaseModel):
    """Safe user object returned to the client (no password)."""
    id: str
    name: str
    email: str
    role: str
    is_active: bool
    created_at: datetime
    last_login: Optional[datetime] = None

    class Config:
        from_attributes = True


# ── Internal schema (never sent to client) ───────────────────────────

class UserInDB(BaseModel):
    """Full user document as stored in MongoDB."""
    id: Optional[str] = None
    name: str
    email: str
    password_hash: str
    role: str = "user"
    is_active: bool = True
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
    last_login: Optional[datetime] = None
