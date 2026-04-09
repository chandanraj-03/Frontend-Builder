"""
Projects router — /api/projects/*

Routes
------
GET    /api/projects               — list user's projects (paginated)
POST   /api/projects               — create project
GET    /api/projects/{id}          — project detail
PATCH  /api/projects/{id}          — update project
DELETE /api/projects/{id}          — delete project + all artifacts
GET    /api/projects/{id}/status   — lightweight status poll
"""

from __future__ import annotations
from typing import Optional, List

from fastapi import APIRouter, HTTPException, Depends, Query
from pydantic import BaseModel, Field

from backend.database.repositories import ProjectRepository, ArtifactRepository
from backend.auth import get_current_user_id

router = APIRouter(prefix="/api/projects", tags=["Projects"])
project_repo  = ProjectRepository()
artifact_repo = ArtifactRepository()


# ── Schemas ───────────────────────────────────────────────────────────

class ProjectCreateBody(BaseModel):
    title:        str           = Field(..., min_length=1, max_length=200)
    prompt:       str           = Field(..., min_length=5)
    color_theme:  str           = "default"
    ollama_model: str           = "qwen3-vl:8b"
    turbo_mode:   bool          = False

class ProjectUpdateBody(BaseModel):
    title:         Optional[str]       = Field(None, min_length=1, max_length=200)
    status:        Optional[str]       = None
    pages:         Optional[List[str]] = None
    output_dir:    Optional[str]       = None
    error_message: Optional[str]       = None


# ── Helpers ───────────────────────────────────────────────────────────

def _assert_owner(project_id: str, user_id: str) -> dict:
    p = project_repo.get_by_id(project_id)
    if not p:
        raise HTTPException(404, "Project not found.")
    if p["user_id"] != user_id:
        raise HTTPException(403, "Access denied.")
    return p


# ── Routes ────────────────────────────────────────────────────────────

@router.get("", summary="List my projects")
def list_projects(
    skip:   int            = Query(0,  ge=0),
    limit:  int            = Query(20, ge=1, le=100),
    status: Optional[str]  = Query(None),
    user_id: str           = Depends(get_current_user_id),
):
    projects = project_repo.get_by_user(user_id, skip=skip, limit=limit, status=status)
    total    = project_repo.count_by_user(user_id)
    return {"projects": projects, "total": total, "skip": skip, "limit": limit}


@router.post("", status_code=201, summary="Create project")
def create_project(body: ProjectCreateBody, user_id: str = Depends(get_current_user_id)):
    project = project_repo.create(
        user_id      = user_id,
        title        = body.title,
        prompt       = body.prompt,
        color_theme  = body.color_theme,
        ollama_model = body.ollama_model,
        turbo_mode   = body.turbo_mode,
    )
    return project


@router.get("/{project_id}", summary="Get project detail")
def get_project(project_id: str, user_id: str = Depends(get_current_user_id)):
    return _assert_owner(project_id, user_id)


@router.get("/{project_id}/status", summary="Poll build status")
def get_status(project_id: str, user_id: str = Depends(get_current_user_id)):
    p = _assert_owner(project_id, user_id)
    return {
        "id":            p["id"],
        "status":        p["status"],
        "pages":         p.get("pages", []),
        "error_message": p.get("error_message"),
        "completed_at":  p.get("completed_at"),
    }


@router.patch("/{project_id}", summary="Update project")
def update_project(
    project_id: str,
    body: ProjectUpdateBody,
    user_id: str = Depends(get_current_user_id),
):
    _assert_owner(project_id, user_id)
    fields = {k: v for k, v in body.dict().items() if v is not None}
    if not fields:
        raise HTTPException(400, "No fields to update.")
    return project_repo.update(project_id, fields)


@router.delete("/{project_id}", status_code=204, summary="Delete project + artifacts")
def delete_project(project_id: str, user_id: str = Depends(get_current_user_id)):
    _assert_owner(project_id, user_id)
    artifact_repo.delete_by_project(project_id)
    project_repo.delete(project_id)

