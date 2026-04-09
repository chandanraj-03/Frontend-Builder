"""
FastAPI Application Entry-Point — Frontend AI Builder
=====================================================

All route logic lives in transformer_core/api/<router_*.py>.
This file only wires everything together.

Run:
    uvicorn backend.main:app --reload --port 8000
    (from the webdev/ workspace root)

API Reference:
    http://localhost:8000/api/docs      ← Swagger UI
    http://localhost:8000/api/redoc     ← ReDoc
"""

from __future__ import annotations
import os
import sys

from dotenv import load_dotenv
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse

# ── Path ─────────────────────────────────────────────────────────────
_root = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
sys.path.insert(0, _root)
sys.path.insert(0, os.path.join(_root, "transformer_core"))


CORS_ORIGINS = os.getenv(
    "CORS_ORIGINS",
    "http://localhost:5173,http://localhost:5174,http://localhost:5175"
).split(",")

# ── DB ────────────────────────────────────────────────────────────────
from backend.database.connection import ping_database, close_connection

# ── Routers ───────────────────────────────────────────────────────────
from backend.api import (
    auth_router,
    projects_router,
    build_router,
    artifacts_router,
    dashboard_router,
    templates_router,
    settings_router,
    chat_router,
)

# ── App ───────────────────────────────────────────────────────────────
app = FastAPI(
    title="Frontend AI Builder API",
    description="REST backend for the Multi-Agent Web Application Builder",
    version="1.0.0",
    docs_url="/api/docs",
    redoc_url="/api/redoc",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── Mount all routers ─────────────────────────────────────────────────
app.include_router(auth_router)
app.include_router(projects_router)
app.include_router(build_router)
app.include_router(artifacts_router)
app.include_router(dashboard_router)
app.include_router(templates_router)
app.include_router(settings_router)
app.include_router(chat_router)


# ── Lifecycle ─────────────────────────────────────────────────────────

@app.on_event("startup")
async def startup():
    # Ping non-blockingly — server starts regardless of Atlas availability
    # Use a short timeout so startup completes fast even if Atlas is unreachable
    import asyncio
    from backend.database.connection import get_client, MONGODB_DB_NAME
    import certifi
    from pymongo import MongoClient

    async def _ping():
        try:
            # Quick-connect client with 5s timeout only for the startup ping
            probe = MongoClient(
                os.getenv("MONGODB_URI"),
                serverSelectionTimeoutMS=5000,
                connectTimeoutMS=5000,
                tlsCAFile=certifi.where(),
            )
            probe.admin.command("ping")
            probe.close()
            print("[DB] ✓ MongoDB Atlas reachable at startup")
        except Exception as exc:
            print(f"[DB] ⚠ Atlas unreachable at startup (will retry on first request): {exc.__class__.__name__}")
    
    asyncio.ensure_future(_ping())


@app.on_event("shutdown")
async def shutdown():
    close_connection()


# ── Health (public) ───────────────────────────────────────────────────

@app.get("/api/health", tags=["System"], summary="Health check")
def health_check():
    db_ok = ping_database()
    return {
        "status":   "ok" if db_ok else "degraded",
        "database": "connected" if db_ok else "unreachable",
        "service":  "Frontend AI Builder API",
        "version":  "1.0.0",
    }


# ── Entry point ───────────────────────────────────────────────────────

if __name__ == "__main__":
    import uvicorn
    host = os.getenv("API_HOST", "0.0.0.0")
    port = int(os.getenv("API_PORT", "8000"))
    uvicorn.run("backend.main:app", host=host, port=port, reload=True)

