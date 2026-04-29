"""
Build router — /api/build/* + WebSocket /ws/build/{project_id}

Routes
------
POST /api/build/{project_id}/start   — trigger AI pipeline for a project
POST /api/build/{project_id}/cancel  — request cancellation (best-effort)
WS   /ws/build/{project_id}          — stream live log lines to the client
"""

from __future__ import annotations
import asyncio
import json
import os
import sys
import threading
from datetime import datetime
from typing import Dict

from fastapi import APIRouter, WebSocket, WebSocketDisconnect, HTTPException, Depends

# path correction so we can import transformer_core modules
_root_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", ".."))
sys.path.insert(0, _root_dir)
# also add transformer_core so 'import config' works inside it
sys.path.insert(0, os.path.join(_root_dir, "transformer_core"))

from backend.database.repositories import ProjectRepository, ArtifactRepository
from backend.auth import get_current_user_id
from transformer_core.config import AVAILABLE_MODELS, MODEL_TIER_MAP, COLOR_THEMES, OUTPUT_DIR

router = APIRouter(tags=["Build"])

project_repo  = ProjectRepository()
artifact_repo = ArtifactRepository()

# ── In-memory build state ─────────────────────────────────────────────
# Maps project_id → {"log": [...], "done": bool, "cancel": threading.Event}
_builds: Dict[str, dict] = {}


# ── WebSocket Manager ─────────────────────────────────────────────────

class _ConnectionManager:
    def __init__(self):
        self._active: Dict[str, list] = {}

    def subscribe(self, project_id: str, ws: WebSocket):
        self._active.setdefault(project_id, []).append(ws)

    def unsubscribe(self, project_id: str, ws: WebSocket):
        if project_id in self._active:
            self._active[project_id] = [w for w in self._active[project_id] if w is not ws]

    async def broadcast(self, project_id: str, message: dict):
        stale = []
        for ws in self._active.get(project_id, []):
            try:
                await ws.send_json(message)
            except Exception:
                stale.append(ws)
        for ws in stale:
            self.unsubscribe(project_id, ws)


_manager = _ConnectionManager()


# ── Pipeline runner (runs in a thread, pushes logs) ───────────────────

def _run_pipeline(project_id: str, project: dict, user_id: str):
    """
    Runs the multi-agent pipeline in a background thread.
    Each agent step appends a log entry and broadcasts it.
    """
    loop = asyncio.new_event_loop()

    def emit(level: str, message: str):
        entry = {"level": level, "message": message, "ts": datetime.utcnow().isoformat()}
        _builds[project_id]["log"].append(entry)
        asyncio.run_coroutine_threadsafe(
            _manager.broadcast(project_id, {"type": "log", **entry}),
            loop,
        )

    async def _run_loop():
        try:
            project_repo.set_status(project_id, "running")
            asyncio.run_coroutine_threadsafe(
                _manager.broadcast(project_id, {"type": "status", "status": "running"}),
                loop,
            )

            emit("info", f"� Prompt: {project['prompt'][:120]}...")

            cancel_evt = _builds[project_id]["cancel"]

            # Import agents lazily (they import ollama, which may be slow)
            from transformer_core.agents import (
                ConversationAgent, RequirementAgent, PageDiscoveryAgent,
                PlanAgent, CodeAgent, ReadmeAgent,
            )
            from transformer_core.config import OLLAMA_MODEL

            raw_model = project.get("ollama_model") or OLLAMA_MODEL
            # Map UI tier keys (fast/balanced/advanced/creative) to real model names
            model = MODEL_TIER_MAP.get(raw_model, raw_model) or OLLAMA_MODEL
            emit("info", f"🚀 Starting build — model: {model} (tier: {raw_model})")
            prompt   = project["prompt"]
            theme    = project.get("color_theme", "default")
            out_base = OUTPUT_DIR

            import functools

            # ── Stage 1 — Conversation / clarification ────────────────────
            emit("stage", "Stage 1/6 — Analysing prompt...")
            if cancel_evt.is_set():
                raise RuntimeError("Build cancelled by user.")
            conv_agent = ConversationAgent(model=model)
            clarified  = await asyncio.get_event_loop().run_in_executor(
                None, conv_agent.run, prompt
            )
            emit("info", f"Clarified intent: {str(clarified)[:200]}")

            # ── Stage 2 — Requirements ────────────────────────────────────
            emit("stage", "Stage 2/6 — Extracting requirements...")
            if cancel_evt.is_set():
                raise RuntimeError("Build cancelled by user.")
            req_agent = RequirementAgent(model=model)
            reqs = await asyncio.get_event_loop().run_in_executor(
                None, req_agent.run, clarified
            )
            emit("info", f"Requirements extracted: {len(str(reqs))} chars")

            # ── Stage 3 — Page discovery ──────────────────────────────────
            emit("stage", "Stage 3/6 — Discovering pages...")
            if cancel_evt.is_set():
                raise RuntimeError("Build cancelled by user.")
            page_agent  = PageDiscoveryAgent(model=model)
            pages_result = await asyncio.get_event_loop().run_in_executor(
                None, functools.partial(page_agent.run, reqs, clarified)
            )
            # pages_result is {"pages": [{"name": ..., "filename": ...}, ...]}
            page_list  = pages_result.get("pages", []) if isinstance(pages_result, dict) else []
            page_names = [p.get("name", "index") for p in page_list] if page_list else ["index"]
            for pg in page_names:
                project_repo.add_page(project_id, pg)
            emit("info", f"Pages found: {', '.join(page_names)}")

            # ── Stage 4 — Plan ────────────────────────────────────────────
            emit("stage", "Stage 4/6 — Creating layout plan...")
            if cancel_evt.is_set():
                raise RuntimeError("Build cancelled by user.")
            plan_agent = PlanAgent(model=model)
            plan = await asyncio.get_event_loop().run_in_executor(
                None, functools.partial(plan_agent.run, pages_result, reqs)
            )
            emit("info", "Layout plan created.")

            # ── Stage 5 — Code generation ─────────────────────────────────
            emit("stage", "Stage 5/6 — Generating code...")
            color_config = COLOR_THEMES.get(theme, COLOR_THEMES["default"])
            code_agent   = CodeAgent(model=model)

            import re, datetime as dt
            safe_title = re.sub(r"[^a-z0-9_]", "_", project.get("title", "project").lower())[:30]
            stamp      = dt.datetime.now().strftime("%Y%m%d_%H%M%S")
            proj_dir   = os.path.join(out_base, f"{safe_title}_{stamp}")
            os.makedirs(proj_dir, exist_ok=True)

            files = await asyncio.get_event_loop().run_in_executor(
                None, functools.partial(code_agent.run, pages_result, reqs, plan, proj_dir, color_config)
            )
            for fname, content in (files or {}).items():
                ftype = fname.rsplit(".", 1)[-1] if "." in fname else "other"
                artifact_repo.upsert(
                    project_id = project_id,
                    user_id    = user_id,
                    filename   = fname,
                    content    = content,
                    file_type  = ftype,
                    agent      = "code_agent",
                )
                emit("info", f"  ✓ {fname}")

            # ── Stage 6 — README ──────────────────────────────────────────
            emit("stage", "Stage 6/6 — Writing README...")
            readme_agent = ReadmeAgent(model=model)
            readme_txt   = await asyncio.get_event_loop().run_in_executor(
                None, functools.partial(readme_agent.run, clarified, reqs, pages_result, files or {}, proj_dir)
            )
            readme_path = os.path.join(proj_dir, "README.md")
            with open(readme_path, "w", encoding="utf-8") as f:
                f.write(readme_txt or "")
            artifact_repo.upsert(
                project_id = project_id,
                user_id    = user_id,
                filename   = "README.md",
                content    = readme_txt or "",
                file_type  = "readme",
                agent      = "readme_agent",
            )

            # ── Done ──────────────────────────────────────────────────────
            project_repo.update(project_id, {"output_dir": proj_dir})
            project_repo.set_status(project_id, "completed")
            emit("success", "✅ Build completed successfully!")
            await _manager.broadcast(project_id, {"type": "status", "status": "completed"})

        except RuntimeError as cancel_err:
            project_repo.set_status(project_id, "failed", str(cancel_err))
            emit("warning", f"⚠️ {cancel_err}")
            await _manager.broadcast(project_id, {"type": "status", "status": "cancelled"})

        except Exception as exc:
            project_repo.set_status(project_id, "failed", str(exc))
            emit("error", f"❌ Build failed: {exc}")
            await _manager.broadcast(project_id, {"type": "status", "status": "failed"})

        finally:
            _builds[project_id]["done"] = True
            loop.stop()

    loop.run_until_complete(_run_loop())


# ── REST triggers ─────────────────────────────────────────────────────

@router.post("/api/build/{project_id}/start", summary="Trigger AI pipeline build")
def start_build(project_id: str, user_id: str = Depends(get_current_user_id)):
    project = project_repo.get_by_id(project_id)
    if not project:
        raise HTTPException(404, "Project not found.")
    if project["user_id"] != user_id:
        raise HTTPException(403, "Access denied.")
    if project["status"] == "running":
        raise HTTPException(409, "Build already running.")

    cancel_evt = threading.Event()
    _builds[project_id] = {"log": [], "done": False, "cancel": cancel_evt}

    t = threading.Thread(
        target=_run_pipeline,
        args=(project_id, project, user_id),
        daemon=True,
    )
    t.start()
    return {"message": "Build started.", "project_id": project_id}


@router.post("/api/build/{project_id}/cancel", summary="Cancel running build")
def cancel_build(project_id: str, user_id: str = Depends(get_current_user_id)):
    project = project_repo.get_by_id(project_id)
    if not project:
        raise HTTPException(404, "Project not found.")
    if project["user_id"] != user_id:
        raise HTTPException(403, "Access denied.")
    state = _builds.get(project_id)
    if not state or state["done"]:
        raise HTTPException(400, "No active build for this project.")
    state["cancel"].set()
    return {"message": "Cancellation requested."}


# ── WebSocket endpoint ────────────────────────────────────────────────

@router.websocket("/ws/build/{project_id}")
async def ws_build_log(websocket: WebSocket, project_id: str):
    """
    WebSocket endpoint for live build logs.

    On connect, immediately replays any already-buffered log lines
    (so late joiners catch up), then streams new entries in real-time.
    """
    await websocket.accept()
    _manager.subscribe(project_id, websocket)

    try:
        # Replay buffered log
        state = _builds.get(project_id)
        if state:
            for entry in state["log"]:
                await websocket.send_json({"type": "log", **entry})
            if state["done"]:
                proj = project_repo.get_by_id(project_id)
                await websocket.send_json({
                    "type":   "status",
                    "status": proj["status"] if proj else "unknown",
                })

        # Keep connection alive — client closes when done
        while True:
            try:
                await asyncio.wait_for(websocket.receive_text(), timeout=30)
            except asyncio.TimeoutError:
                await websocket.send_json({"type": "ping"})

    except WebSocketDisconnect:
        pass
    finally:
        _manager.unsubscribe(project_id, websocket)

