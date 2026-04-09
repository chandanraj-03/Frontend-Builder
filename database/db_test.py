"""
db_test.py — Quick connectivity and smoke-test for MongoDB Atlas.

Run from the project root:
    python database/db_test.py
"""

import sys
import os
sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))

from colorama import Fore, Style, init
init()

def run_tests():
    print(f"\n{Fore.CYAN}{'='*55}")
    print("  MongoDB Atlas — Connection & Smoke Test")
    print(f"{'='*55}{Style.RESET_ALL}\n")

    # ── 1. Ping ────────────────────────────────────────────────────
    print(f"{Fore.YELLOW}[1/5] Pinging Atlas cluster...{Style.RESET_ALL}")
    from database.connection import ping_database
    ok = ping_database()
    if not ok:
        print(f"{Fore.RED}Aborting — cannot reach MongoDB Atlas.{Style.RESET_ALL}")
        sys.exit(1)

    # ── 2. User CRUD ───────────────────────────────────────────────
    print(f"\n{Fore.YELLOW}[2/5] Testing UserRepository...{Style.RESET_ALL}")
    from database.repositories import UserRepository
    from transformer_core.auth import hash_password

    user_repo = UserRepository()
    test_email = "test_smoke@example.com"

    # clean up any leftover
    existing = user_repo.get_by_email(test_email)
    if existing:
        user_repo.delete(existing["id"])

    user = user_repo.create(
        name="Smoke Tester",
        email=test_email,
        password_hash=hash_password("Test@1234"),
    )
    print(f"  Created user: {user['id']} — {user['email']}")

    fetched = user_repo.get_by_email(test_email)
    assert fetched and fetched["name"] == "Smoke Tester", "get_by_email failed"
    print(f"  {Fore.GREEN}✓ UserRepository OK{Style.RESET_ALL}")

    # ── 3. Project CRUD ────────────────────────────────────────────
    print(f"\n{Fore.YELLOW}[3/5] Testing ProjectRepository...{Style.RESET_ALL}")
    from database.repositories import ProjectRepository

    project_repo = ProjectRepository()
    project = project_repo.create(
        user_id=user["id"],
        title="Test Project",
        prompt="Build a simple portfolio page",
        color_theme="dark",
    )
    print(f"  Created project: {project['id']} — {project['title']}")
    project_repo.set_status(project["id"], "completed")
    updated = project_repo.get_by_id(project["id"])
    assert updated["status"] == "completed", "set_status failed"
    print(f"  {Fore.GREEN}✓ ProjectRepository OK{Style.RESET_ALL}")

    # ── 4. Artifact CRUD ───────────────────────────────────────────
    print(f"\n{Fore.YELLOW}[4/5] Testing ArtifactRepository...{Style.RESET_ALL}")
    from database.repositories import ArtifactRepository

    artifact_repo = ArtifactRepository()
    artifact = artifact_repo.create(
        project_id=project["id"],
        user_id=user["id"],
        filename="index.html",
        content="<html><body>Hello World</body></html>",
        file_type="html",
        page_name="Home",
        agent="html_agent",
    )
    print(f"  Created artifact: {artifact['id']} — {artifact['filename']}")
    artifacts = artifact_repo.get_by_project(project["id"])
    assert len(artifacts) == 1, "get_by_project failed"
    print(f"  {Fore.GREEN}✓ ArtifactRepository OK{Style.RESET_ALL}")

    # ── 5. Dashboard stats ─────────────────────────────────────────
    print(f"\n{Fore.YELLOW}[5/5] Testing dashboard stats...{Style.RESET_ALL}")
    stats = project_repo.get_dashboard_stats()
    print(f"  Stats: {stats}")
    print(f"  {Fore.GREEN}✓ Dashboard stats OK{Style.RESET_ALL}")

    # ── Cleanup ────────────────────────────────────────────────────
    print(f"\n{Fore.YELLOW}Cleaning up test data...{Style.RESET_ALL}")
    artifact_repo.delete_by_project(project["id"])
    project_repo.delete(project["id"])
    user_repo.delete(user["id"])
    print(f"  Test data removed.")

    print(f"\n{Fore.GREEN}{'='*55}")
    print("  ALL TESTS PASSED ✓")
    print(f"{'='*55}{Style.RESET_ALL}\n")


if __name__ == "__main__":
    run_tests()
