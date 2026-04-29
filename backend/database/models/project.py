"""
Project model — maps to the 'projects' collection in MongoDB.

Collection schema
-----------------
projects: {
    _id          : ObjectId
    user_id      : str           # owner's ObjectId as string
    title        : str
    prompt       : str           # original user prompt
    status       : "pending" | "running" | "completed" | "failed"
    pages        : list[str]     # page names discovered
    color_theme  : str
    ollama_model : str
    output_dir   : str | None    # local path to generated files
    created_at   : datetime
    updated_at   : datetime
    completed_at : datetime | None
    error_message: str | None
}
"""

from __future__ import annotations
from datetime import datetime
from typing import Optional, List
from pydantic import BaseModel, Field


# ── Request schemas ──────────────────────────────────────────────────

class ProjectCreate(BaseModel):
    """Payload for POST /api/projects."""
    title: str = Field(..., min_length=1, max_length=200)
    prompt: str = Field(..., min_length=5)
    color_theme: str = "default"
    ollama_model: str = "qwen3-vl:8b"


class ProjectUpdate(BaseModel):
    """Payload for PATCH /api/projects/{id}."""
    title: Optional[str] = Field(None, min_length=1, max_length=200)
    status: Optional[str] = None          # "pending"|"running"|"completed"|"failed"
    pages: Optional[List[str]] = None
    output_dir: Optional[str] = None
    error_message: Optional[str] = None
    completed_at: Optional[datetime] = None


# ── Response schema ──────────────────────────────────────────────────

class ProjectResponse(BaseModel):
    """Project document returned to the client."""
    id: str
    user_id: str
    title: str
    prompt: str
    status: str
    pages: List[str] = []
    color_theme: str
    ollama_model: str
    output_dir: Optional[str] = None
    created_at: datetime
    updated_at: datetime
    completed_at: Optional[datetime] = None
    error_message: Optional[str] = None

    class Config:
        from_attributes = True
