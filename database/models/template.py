"""
Template model — maps to the 'templates' collection in MongoDB.

Collection schema
-----------------
templates: {
    _id            : ObjectId
    key            : str           # Unique identifier for the template (e.g. 'portfolio')
    name           : str
    description    : str
    category       : str
    complexity     : str           # "Low" | "Medium" | "High"
    estimated_time : str
    tags           : list[str]
    tech_stack     : list[str]
    features       : int
    prompt         : str
    gradient       : str           # Optional gradient string for UI
    created_at     : datetime
    updated_at     : datetime
}
"""

from __future__ import annotations
from datetime import datetime
from typing import Optional, List
from pydantic import BaseModel, Field

# ── Request schemas ──────────────────────────────────────────────────

class TemplateCreate(BaseModel):
    """Payload for creating or migrating a template."""
    key:            str = Field(..., min_length=1, max_length=100)
    name:           str = Field(..., min_length=1, max_length=200)
    description:    str = Field(...)
    category:       str = Field(...)
    complexity:     str = Field(...)
    estimated_time: str = Field(...)
    tags:           List[str] = Field(default_factory=list)
    tech_stack:     List[str] = Field(default_factory=list)
    features:       int = Field(...)
    prompt:         str = Field(...)
    gradient:       Optional[str] = None


class TemplateUpdate(BaseModel):
    """Payload for updating an existing template."""
    name:           Optional[str] = Field(None, min_length=1, max_length=200)
    description:    Optional[str] = None
    category:       Optional[str] = None
    complexity:     Optional[str] = None
    estimated_time: Optional[str] = None
    tags:           Optional[List[str]] = None
    tech_stack:     Optional[List[str]] = None
    features:       Optional[int] = None
    prompt:         Optional[str] = None
    gradient:       Optional[str] = None


# ── Response schema ──────────────────────────────────────────────────

class TemplateResponse(BaseModel):
    """Template document returned to the client."""
    id:             str
    key:            str
    name:           str
    description:    str
    category:       str
    complexity:     str
    estimated_time: str
    tags:           List[str] = []
    tech_stack:     List[str] = []
    features:       int
    prompt:         str
    gradient:       Optional[str] = None
    created_at:     datetime
    updated_at:     datetime

    class Config:
        from_attributes = True
