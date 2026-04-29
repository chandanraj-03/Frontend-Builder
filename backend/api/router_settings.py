"""
Settings router — /api/settings/*

Routes
------
GET   /api/settings/profile       — alias for GET /api/auth/me
PATCH /api/settings/profile       — update name/email
POST  /api/settings/password      — change password
GET   /api/settings/llm           — get current LLM config
PATCH /api/settings/llm           — update LLM config (stored in DB user doc)
GET   /api/settings/themes        — list available color themes
GET   /api/settings/models        — list available Ollama models
"""

from __future__ import annotations
from typing import Optional

from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel, Field

from backend.database.repositories import UserRepository
from backend.auth import (
    get_current_user_id,
    hash_password,
    verify_password,
)
from transformer_core.config import AVAILABLE_MODELS, COLOR_THEMES, OLLAMA_HOST

router    = APIRouter(prefix="/api/settings", tags=["Settings"])
user_repo = UserRepository()


# ── Schemas ───────────────────────────────────────────────────────────

class ProfileUpdateBody(BaseModel):
    name:   Optional[str] = Field(None, min_length=2, max_length=100)
    email:  Optional[str] = None
    bio:    Optional[str] = None
    avatar: Optional[str] = None  # base64 data-URL

class PasswordBody(BaseModel):
    current_password: str
    new_password:     str = Field(..., min_length=6)

class LLMConfigBody(BaseModel):
    ollama_host:  Optional[str] = None
    ollama_model: Optional[str] = None
    api_key:      Optional[str] = None

class NotifPrefsBody(BaseModel):
    buildComplete: bool = True
    buildFailed:   bool = True
    weeklyReport:  bool = False
    newFeatures:   bool = True


# ── Helpers ───────────────────────────────────────────────────────────

def _safe(user: dict) -> dict:
    return {k: v for k, v in user.items() if k not in ("password_hash",)}


# ── Routes ────────────────────────────────────────────────────────────

@router.get("/profile", summary="Get current user profile")
def get_profile(user_id: str = Depends(get_current_user_id)):
    user = user_repo.get_by_id(user_id)
    if not user:
        raise HTTPException(404, "User not found.")
    return _safe(user)


@router.patch("/profile", summary="Update profile")
def update_profile(body: ProfileUpdateBody, user_id: str = Depends(get_current_user_id)):
    fields = {k: v for k, v in body.dict().items() if v is not None}
    if not fields:
        raise HTTPException(400, "No fields provided.")
    if "email" in fields:
        existing = user_repo.get_by_email(fields["email"])
        if existing and existing["id"] != user_id:
            raise HTTPException(409, "Email already in use.")
    updated = user_repo.update(user_id, fields)
    return _safe(updated)


@router.post("/password", summary="Change password")
def change_password(body: PasswordBody, user_id: str = Depends(get_current_user_id)):
    user = user_repo.get_by_id(user_id)
    if not verify_password(body.current_password, user["password_hash"]):
        raise HTTPException(400, "Current password is incorrect.")
    user_repo.update(user_id, {"password_hash": hash_password(body.new_password)})
    return {"message": "Password changed successfully."}


@router.get("/llm", summary="Get saved LLM configuration")
def get_llm_config(user_id: str = Depends(get_current_user_id)):
    user = user_repo.get_by_id(user_id)
    prefs = user.get("llm_config") or {}
    raw_key = prefs.get("api_key", "")
    # Mask key: show only last 4 chars
    masked_key = ("*" * (len(raw_key) - 4) + raw_key[-4:]) if len(raw_key) > 4 else raw_key
    return {
        "ollama_host":  prefs.get("ollama_host",  OLLAMA_HOST),
        "ollama_model": prefs.get("ollama_model", "qwen3-vl:8b"),
        "api_key":      masked_key,
    }


@router.patch("/llm", summary="Save LLM configuration")
def update_llm_config(body: LLMConfigBody, user_id: str = Depends(get_current_user_id)):
    user  = user_repo.get_by_id(user_id)
    prefs = dict(user.get("llm_config") or {})
    if body.ollama_host  is not None:
        prefs["ollama_host"]  = body.ollama_host
    if body.ollama_model is not None:
        prefs["ollama_model"] = body.ollama_model
    if body.api_key is not None:
        # Only overwrite if a real (non-masked) key is submitted
        if body.api_key and not body.api_key.startswith("***"):
            prefs["api_key"] = body.api_key
    safe_prefs = {k: v for k, v in prefs.items() if k != "api_key"}
    safe_prefs["api_key"] = "****" if prefs.get("api_key") else ""
    user_repo.update(user_id, {"llm_config": prefs})
    return {"message": "LLM configuration saved.", "llm_config": safe_prefs}


@router.get("/themes", summary="List available color themes")
def list_themes():
    return {
        "themes": [
            {"key": k, **{sub_k: sub_v for sub_k, sub_v in v.items()}}
            for k, v in COLOR_THEMES.items()
        ]
    }


@router.get("/models", summary="List available Ollama models")
def list_models():
    return {
        "models": [
            {"key": k, "label": v}
            for k, v in AVAILABLE_MODELS.items()
        ]
    }


@router.get("/notifications", summary="Get notification preferences")
def get_notif_prefs(user_id: str = Depends(get_current_user_id)):
    user = user_repo.get_by_id(user_id)
    if not user:
        raise HTTPException(404, "User not found.")
    prefs = user.get("notif_prefs") or {}
    return {
        "buildComplete": prefs.get("buildComplete", True),
        "buildFailed":   prefs.get("buildFailed",   True),
        "weeklyReport":  prefs.get("weeklyReport",  False),
        "newFeatures":   prefs.get("newFeatures",   True),
    }


@router.patch("/notifications", summary="Save notification preferences")
def update_notif_prefs(body: NotifPrefsBody, user_id: str = Depends(get_current_user_id)):
    prefs = body.dict()
    user_repo.update(user_id, {"notif_prefs": prefs})
    return {"message": "Notification preferences saved.", "notif_prefs": prefs}
