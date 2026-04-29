"""
Dashboard router — /api/dashboard

Routes
------
GET /api/dashboard            — metrics + recent activity + system status
GET /api/dashboard/activity   — recent project activity feed
"""

from __future__ import annotations
import time
from datetime import datetime, timedelta

from fastapi import APIRouter, Depends

from backend.database.repositories import ProjectRepository, ArtifactRepository, UserRepository
from backend.auth import get_current_user_id

router = APIRouter(prefix="/api/dashboard", tags=["Dashboard"])
project_repo  = ProjectRepository()
artifact_repo = ArtifactRepository()
user_repo     = UserRepository()

_start_time = time.time()

STALE_BUILD_MINUTES = 30  # builds stuck longer than this are marked failed


def _cleanup_stale_builds(user_id: str) -> None:
    """Reset builds stuck in running/pending for more than STALE_BUILD_MINUTES."""
    cutoff = datetime.utcnow() - timedelta(minutes=STALE_BUILD_MINUTES)
    project_repo._col.update_many(
        {
            "user_id": user_id,
            "status": {"$in": ["running", "pending"]},
            "updated_at": {"$lt": cutoff},
        },
        {"$set": {"status": "failed", "updated_at": datetime.utcnow()}},
    )


@router.get("", summary="Aggregated dashboard data")
def dashboard(user_id: str = Depends(get_current_user_id)):
    # Auto-reset builds stuck in running/pending for too long
    _cleanup_stale_builds(user_id)

    total_projects   = project_repo.count_by_user(user_id)
    active_builds    = project_repo.count_active_by_user(user_id)
    files_generated  = artifact_repo.count_total_by_user(user_id)

    # Recent 10 projects as activity feed
    recent = project_repo.get_by_user(user_id, skip=0, limit=10)
    activity = [
        {
            "id":        p["id"],
            "title":     p["title"],
            "status":    p["status"],
            "timestamp": p.get("updated_at") or p.get("created_at"),
        }
        for p in recent
    ]

    uptime_seconds = int(time.time() - _start_time)
    h, rem = divmod(uptime_seconds, 3600)
    m, s   = divmod(rem, 60)
    uptime_str = f"{h}h {m}m {s}s"

    # Ping Ollama for LLM engine status (short timeout to avoid proxy ECONNRESET)
    try:
        import requests as _req
        resp = _req.get("http://localhost:11434/api/tags", timeout=3)
        resp.raise_for_status()
        _models = resp.json().get("models", [])
        ollama_status = "Online"
        ollama_models = [m["model"] for m in _models]
    except Exception:
        ollama_status = "Offline"
        ollama_models = []

    # Also include the user's custom saved model if set
    user      = user_repo.get_by_id(user_id)
    llm_prefs = (user or {}).get("llm_config") or {}
    custom_model = llm_prefs.get("ollama_model", "").strip()
    custom_models_out = [{"name": custom_model, "custom": True}] if custom_model else []
    llm_models_out = [{"name": m, "custom": False} for m in ollama_models
                      if m != custom_model]

    return {
        "metrics": {
            "totalProjects":  total_projects,
            "activeBuilds":   active_builds,
            "filesGenerated": files_generated,
        },
        "recentActivities": activity,
        "systemStatus": {
            "status":      "Online",
            "avgResponse": "—",
            "uptime":      uptime_str,
        },
        "llmStatus": {
            "status": ollama_status,
            "models": custom_models_out + llm_models_out,
        },
    }


@router.get("/activity", summary="Recent activity feed only")
def activity_feed(user_id: str = Depends(get_current_user_id)):
    recent = project_repo.get_by_user(user_id, skip=0, limit=20)
    return [
        {
            "id":        p["id"],
            "title":     p["title"],
            "status":    p["status"],
            "timestamp": p.get("updated_at") or p.get("created_at"),
        }
        for p in recent
    ]

@router.get("/stats", summary="Builds per day for the last 7 days")
def dashboard_stats(user_id: str = Depends(get_current_user_id)):
    """
    Returns a list of {date, count} objects for the last 7 calendar days
    (UTC), representing the number of projects created per day.
    """
    from collections import defaultdict

    today = datetime.utcnow().date()
    # Build a zero-filled dict for the last 7 days
    counts: dict[str, int] = {}
    for i in range(6, -1, -1):
        d = (today - timedelta(days=i)).isoformat()
        counts[d] = 0

    # Query all user projects in the 7-day window
    cutoff = datetime.utcnow() - timedelta(days=7)
    cursor = project_repo._col.find(
        {"user_id": user_id, "created_at": {"$gte": cutoff}},
        {"created_at": 1},
    )
    for doc in cursor:
        created = doc.get("created_at")
        if isinstance(created, datetime):
            day = created.date().isoformat()
            if day in counts:
                counts[day] += 1

    return {
        "buildsPerDay": [{"date": d, "count": c} for d, c in counts.items()]
    }
