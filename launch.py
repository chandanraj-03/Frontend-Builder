"""
launch.py — Start the entire project with a single command.

Usage:
    python launch.py

This launches:
    1. FastAPI backend  (uvicorn on port 8000)
    2. Vite frontend    (npm run dev on port 5173)

Press Ctrl+C to stop both servers.
"""

import subprocess
import sys
import os
import signal

ROOT = os.path.dirname(os.path.abspath(__file__))
FRONTEND = os.path.join(ROOT, "frontend")

def main():
    procs = []

    try:
        # ── Backend ──────────────────────────────────────────────────
        print("🚀 Starting backend (uvicorn)...")
        backend = subprocess.Popen(
            [sys.executable, "-m", "uvicorn", "backend.main:app", "--reload", "--port", "8000"],
            cwd=ROOT,
        )
        procs.append(backend)

        # ── Frontend ─────────────────────────────────────────────────
        print("🚀 Starting frontend (vite)...")
        frontend = subprocess.Popen(
            ["npm", "run", "dev"],
            cwd=FRONTEND,
            shell=True,
        )
        procs.append(frontend)

        print("\n✅ Both servers running. Press Ctrl+C to stop.\n")

        # Wait for either to exit
        for p in procs:
            p.wait()

    except KeyboardInterrupt:
        print("\n🛑 Shutting down...")
        for p in procs:
            p.terminate()
        for p in procs:
            try:
                p.wait(timeout=5)
            except subprocess.TimeoutExpired:
                p.kill()
        print("👋 Done.")

if __name__ == "__main__":
    main()
