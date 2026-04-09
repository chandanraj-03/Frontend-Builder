"""
Templates router — /api/templates

Routes
------
GET /api/templates          — list all available templates (summary)
GET /api/templates/{key}    — get full template detail + prompt
"""

from __future__ import annotations

from fastapi import APIRouter, HTTPException

from backend.database.repositories.template_repo import TemplateRepository
from transformer_core.config import COLOR_THEMES

router = APIRouter(prefix="/api/templates", tags=["Templates"])
template_repo = TemplateRepository()


@router.get("", summary="List all available templates")
def list_templates():
    templates = template_repo.get_all()
    result = []
    for tpl in templates:
        result.append({
            "key":            tpl.key,
            "name":           tpl.name,
            "description":    tpl.description,
            "category":       tpl.category,
            "complexity":     tpl.complexity,
            "tags":           tpl.tags,
            "tech_stack":     tpl.tech_stack,
            "features":       tpl.features,
            "estimated_time": tpl.estimated_time,
            "gradient":       tpl.gradient or "linear-gradient(135deg,#4E65FF,#92EFFD)",
            "prompt":         tpl.prompt,
        })
    return {"templates": result, "total": len(result)}


@router.get("/{key}", summary="Get template detail including prompt")
def get_template(key: str):
    tpl = template_repo.get_by_key(key)
    if not tpl:
         raise HTTPException(404, f"Template '{key}' not found.")
    return tpl.model_dump()
