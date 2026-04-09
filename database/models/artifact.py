"""
Artifact model — maps to the 'artifacts' collection in MongoDB.

Each document stores a single generated file (HTML / CSS / JS / README)
produced by the AI agents for a project.

Collection schema
-----------------
artifacts: {
    _id        : ObjectId
    project_id : str          # parent project's ObjectId as string
    user_id    : str          # owner's ObjectId as string
    filename   : str          # e.g. "index.html", "style.css"
    file_type  : "html" | "css" | "js" | "readme" | "other"
    content    : str          # full generated source code
    page_name  : str | None   # which page this file belongs to
    agent      : str | None   # which agent produced it
    created_at : datetime
}
"""

from __future__ import annotations
from datetime import datetime
from typing import Optional
from pydantic import BaseModel, Field


# ── Request schema ───────────────────────────────────────────────────

class ArtifactCreate(BaseModel):
    """Used internally when an agent saves a generated file."""
    project_id: str
    user_id: str
    filename: str
    file_type: str = "other"         # "html" | "css" | "js" | "readme" | "other"
    content: str
    page_name: Optional[str] = None
    agent: Optional[str] = None


# ── Response schema ──────────────────────────────────────────────────

class ArtifactResponse(BaseModel):
    """Artifact document returned to the client."""
    id: str
    project_id: str
    user_id: str
    filename: str
    file_type: str
    content: str
    page_name: Optional[str] = None
    agent: Optional[str] = None
    created_at: datetime

    class Config:
        from_attributes = True
