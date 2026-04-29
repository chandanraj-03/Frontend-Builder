"""
ProjectRepository — CRUD operations on the 'projects' collection.
"""

from __future__ import annotations
from datetime import datetime
from typing import Optional, List

from bson import ObjectId
from bson.errors import InvalidId
from pymongo.collection import Collection
from pymongo import DESCENDING, ASCENDING

from ..connection import get_database


def _to_str_id(doc: dict) -> dict:
    if doc and "_id" in doc:
        doc["id"] = str(doc.pop("_id"))
    return doc


class ProjectRepository:
    """All database operations for the projects collection."""

    def __init__(self):
        self._col: Collection = get_database()["projects"]
        try:
            self._ensure_indexes()
        except Exception:
            pass  # Atlas temporarily unreachable

    # ── Indexes ──────────────────────────────────────────────────────

    def _ensure_indexes(self) -> None:
        self._col.create_index([("user_id", ASCENDING)], background=True)
        self._col.create_index([("created_at", DESCENDING)], background=True)
        self._col.create_index([("status", ASCENDING)], background=True)

    # ── Create ───────────────────────────────────────────────────────

    def create(
        self,
        user_id: str,
        title: str,
        prompt: str,
        color_theme: str = "default",
        ollama_model: str = "qwen3-vl:8b",
    ) -> dict:
        now = datetime.utcnow()
        doc = {
            "user_id": user_id,
            "title": title,
            "prompt": prompt,
            "status": "pending",
            "pages": [],
            "color_theme": color_theme,
            "ollama_model": ollama_model,
            "output_dir": None,
            "created_at": now,
            "updated_at": now,
            "completed_at": None,
            "error_message": None,
        }
        result = self._col.insert_one(doc)
        doc["id"] = str(result.inserted_id)
        doc.pop("_id", None)
        return doc

    # ── Read ─────────────────────────────────────────────────────────

    def get_by_id(self, project_id: str) -> Optional[dict]:
        try:
            doc = self._col.find_one({"_id": ObjectId(project_id)})
        except InvalidId:
            return None
        return _to_str_id(doc) if doc else None

    def get_by_user(
        self,
        user_id: str,
        skip: int = 0,
        limit: int = 20,
        status: Optional[str] = None,
    ) -> List[dict]:
        query: dict = {"user_id": user_id}
        if status:
            query["status"] = status
        cursor = (
            self._col.find(query)
            .sort("created_at", DESCENDING)
            .skip(skip)
            .limit(limit)
        )
        return [_to_str_id(doc) for doc in cursor]

    def count_by_user(self, user_id: str) -> int:
        return self._col.count_documents({"user_id": user_id})

    def count_by_status(self, status: str) -> int:
        return self._col.count_documents({"status": status})

    def count_active_by_user(self, user_id: str) -> int:
        """Count projects in running or pending state for a specific user."""
        return self._col.count_documents({
            "user_id": user_id,
            "status": {"$in": ["running", "pending"]}
        })

    # ── Update ───────────────────────────────────────────────────────

    def update(self, project_id: str, fields: dict) -> Optional[dict]:
        fields["updated_at"] = datetime.utcnow()
        try:
            self._col.update_one({"_id": ObjectId(project_id)}, {"$set": fields})
        except InvalidId:
            return None
        return self.get_by_id(project_id)

    def set_status(self, project_id: str, status: str, error: Optional[str] = None) -> None:
        fields: dict = {"status": status, "updated_at": datetime.utcnow()}
        if status == "completed":
            fields["completed_at"] = datetime.utcnow()
        if error:
            fields["error_message"] = error
        try:
            self._col.update_one({"_id": ObjectId(project_id)}, {"$set": fields})
        except InvalidId:
            pass

    def add_page(self, project_id: str, page_name: str) -> None:
        try:
            self._col.update_one(
                {"_id": ObjectId(project_id)},
                {
                    "$addToSet": {"pages": page_name},
                    "$set": {"updated_at": datetime.utcnow()},
                },
            )
        except InvalidId:
            pass

    # ── Delete ───────────────────────────────────────────────────────

    def delete(self, project_id: str) -> bool:
        try:
            result = self._col.delete_one({"_id": ObjectId(project_id)})
        except InvalidId:
            return False
        return result.deleted_count == 1

    # ── Dashboard stats ──────────────────────────────────────────────

    def get_dashboard_stats(self) -> dict:
        pipeline = [
            {"$group": {"_id": "$status", "count": {"$sum": 1}}}
        ]
        status_counts = {doc["_id"]: doc["count"] for doc in self._col.aggregate(pipeline)}
        return {
            "total": self._col.count_documents({}),
            "pending": status_counts.get("pending", 0),
            "running": status_counts.get("running", 0),
            "completed": status_counts.get("completed", 0),
            "failed": status_counts.get("failed", 0),
        }
