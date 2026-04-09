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
import time
import urllib.request
import urllib.error

ROOT = os.path.dirname(os.path.abspath(__file__))
FRONTEND = os.path.join(ROOT, "frontend")

def wait_for_backend(max_retries=30):
    """Wait for backend to be ready before starting frontend."""
    for attempt in range(max_retries):
        try:
            response = urllib.request.urlopen("http://localhost:8000/api/health", timeout=2)
            if response.status == 200:
                print("✅ Backend is ready!")
                return True
        except (urllib.error.URLError, urllib.error.HTTPError, TimeoutError):
            pass
        
        if attempt < max_retries - 1:
            print(f"⏳ Waiting for backend... ({attempt + 1}/{max_retries})")
            time.sleep(1)
    
    return False

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

        # ── Wait for backend to be ready ──────────────────────────────
        if not wait_for_backend():
            print("❌ Backend failed to start. Check terminal output above.")
            backend.terminate()
            return

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
