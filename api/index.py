"""
Vercel serverless entry-point for the FastAPI backend.

Vercel routes all /api/* requests here via vercel.json.
Mangum wraps the ASGI FastAPI app so Vercel's Python runtime
can invoke it as a serverless function.
"""

import sys
import os

# ── Make the repo root importable ────────────────────────────────────
_root = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.insert(0, _root)
sys.path.insert(0, os.path.join(_root, "transformer_core"))

# Load .env (backend/.env) for local testing of this entry-point
from dotenv import load_dotenv
load_dotenv(os.path.join(_root, "backend", ".env"))

from backend.main import app          # FastAPI application
from mangum import Mangum             # ASGI → WSGI adapter for Vercel

# Vercel invokes 'handler' for every serverless function call.
# lifespan="off" skips startup/shutdown events (MongoDB ping happens on first request).
handler = Mangum(app, lifespan="off")
