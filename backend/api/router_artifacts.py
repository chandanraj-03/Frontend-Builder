"""
Artifacts router — /api/projects/{id}/artifacts/*

Routes
------
GET   /api/projects/{id}/artifacts           — list all artifacts
GET   /api/projects/{id}/artifacts/{aid}     — single artifact with content
GET   /api/projects/{id}/download            — download all files as ZIP
DELETE /api/projects/{id}/artifacts/{aid}    — delete one artifact
"""

from __future__ import annotations
import io
import zipfile

from fastapi import APIRouter, HTTPException, Depends
from fastapi.responses import StreamingResponse

from backend.database.repositories import ProjectRepository, ArtifactRepository
from backend.auth import get_current_user_id

router = APIRouter(prefix="/api/projects", tags=["Artifacts"])
project_repo  = ProjectRepository()
artifact_repo = ArtifactRepository()


def _assert_owner(project_id: str, user_id: str) -> dict:
    p = project_repo.get_by_id(project_id)
    if not p:
        raise HTTPException(404, "Project not found.")
    if p["user_id"] != user_id:
        raise HTTPException(403, "Access denied.")
    return p


@router.get("/{project_id}/artifacts", summary="List project artifacts (no content)")
def list_artifacts(project_id: str, user_id: str = Depends(get_current_user_id)):
    _assert_owner(project_id, user_id)
    artifacts = artifact_repo.get_by_project(project_id)
    # Strip heavy content field from list view
    slim = [
        {k: v for k, v in a.items() if k != "content"}
        for a in artifacts
    ]
    return {"artifacts": slim, "total": len(slim)}


@router.get("/{project_id}/artifacts/{artifact_id}", summary="Get artifact with full content")
def get_artifact(
    project_id: str,
    artifact_id: str,
    user_id: str = Depends(get_current_user_id),
):
    _assert_owner(project_id, user_id)
    artifact = artifact_repo.get_by_id(artifact_id)
    if not artifact or artifact["project_id"] != project_id:
        raise HTTPException(404, "Artifact not found.")
    return artifact


@router.get("/{project_id}/download", summary="Download all artifacts as ZIP")
def download_zip(project_id: str, user_id: str = Depends(get_current_user_id)):
    project   = _assert_owner(project_id, user_id)
    artifacts = artifact_repo.get_by_project(project_id)
    if not artifacts:
        raise HTTPException(404, "No artifacts to download.")

    buf = io.BytesIO()
    with zipfile.ZipFile(buf, "w", zipfile.ZIP_DEFLATED) as zf:
        for art in artifacts:
            zf.writestr(art["filename"], art.get("content", ""))
    buf.seek(0)

    safe_title = "".join(c if c.isalnum() else "_" for c in project.get("title", "project"))
    filename   = f"{safe_title}.zip"

    return StreamingResponse(
        buf,
        media_type="application/zip",
        headers={"Content-Disposition": f'attachment; filename="{filename}"'},
    )


@router.delete(
    "/{project_id}/artifacts/{artifact_id}",
    status_code=204,
    summary="Delete single artifact",
)
def delete_artifact(
    project_id: str,
    artifact_id: str,
    user_id: str = Depends(get_current_user_id),
):
    _assert_owner(project_id, user_id)
    artifact = artifact_repo.get_by_id(artifact_id)
    if not artifact or artifact["project_id"] != project_id:
        raise HTTPException(404, "Artifact not found.")
    artifact_repo.delete(artifact_id)

