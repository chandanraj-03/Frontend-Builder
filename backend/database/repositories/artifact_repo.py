"""
ArtifactRepository — CRUD operations on the 'artifacts' collection.
"""

from __future__ import annotations
from datetime import datetime
from typing import Optional, List

from bson import ObjectId
from bson.errors import InvalidId
from pymongo.collection import Collection
from pymongo import ASCENDING

from ..connection import get_database


def _to_str_id(doc: dict) -> dict:
    if doc and "_id" in doc:
        doc["id"] = str(doc.pop("_id"))
    return doc


class ArtifactRepository:
    """All database operations for the artifacts collection."""

    def __init__(self):
        self._col: Collection = get_database()["artifacts"]
        try:
            self._ensure_indexes()
        except Exception:
            pass  # Atlas temporarily unreachable

    # ── Indexes ──────────────────────────────────────────────────────

    def _ensure_indexes(self) -> None:
        self._col.create_index([("project_id", ASCENDING)], background=True)
        self._col.create_index([("user_id", ASCENDING)], background=True)
        self._col.create_index(
            [("project_id", ASCENDING), ("filename", ASCENDING)],
            unique=True,
            background=True,
        )

    # ── Create ───────────────────────────────────────────────────────

    def create(
        self,
        project_id: str,
        user_id: str,
        filename: str,
        content: str,
        file_type: str = "other",
        page_name: Optional[str] = None,
        agent: Optional[str] = None,
    ) -> dict:
        doc = {
            "project_id": project_id,
            "user_id": user_id,
            "filename": filename,
            "file_type": file_type,
            "content": content,
            "page_name": page_name,
            "agent": agent,
            "created_at": datetime.utcnow(),
        }
        result = self._col.insert_one(doc)
        doc["id"] = str(result.inserted_id)
        doc.pop("_id", None)
        return doc

    def upsert(
        self,
        project_id: str,
        user_id: str,
        filename: str,
        content: str,
        file_type: str = "other",
        page_name: Optional[str] = None,
        agent: Optional[str] = None,
    ) -> dict:
        """Insert or update an artifact by (project_id, filename)."""
        now = datetime.utcnow()
        doc_fields = {
            "user_id": user_id,
            "file_type": file_type,
            "content": content,
            "page_name": page_name,
            "agent": agent,
        }
        self._col.update_one(
            {"project_id": project_id, "filename": filename},
            {
                "$set": doc_fields,
                "$setOnInsert": {"created_at": now},
            },
            upsert=True,
        )
        doc = self._col.find_one({"project_id": project_id, "filename": filename})
        return _to_str_id(doc) if doc else {}

    # ── Read ─────────────────────────────────────────────────────────

    def get_by_id(self, artifact_id: str) -> Optional[dict]:
        try:
            doc = self._col.find_one({"_id": ObjectId(artifact_id)})
        except InvalidId:
            return None
        return _to_str_id(doc) if doc else None

    def get_by_project(self, project_id: str) -> List[dict]:
        cursor = self._col.find({"project_id": project_id}).sort("filename", ASCENDING)
        return [_to_str_id(doc) for doc in cursor]

    def get_by_project_and_type(self, project_id: str, file_type: str) -> List[dict]:
        cursor = self._col.find({"project_id": project_id, "file_type": file_type})
        return [_to_str_id(doc) for doc in cursor]

    def get_by_user(self, user_id: str) -> List[dict]:
        cursor = self._col.find({"user_id": user_id}).sort("created_at", -1)
        return [_to_str_id(doc) for doc in cursor]

    def count_by_project(self, project_id: str) -> int:
        return self._col.count_documents({"project_id": project_id})

    def count_total_by_user(self, user_id: str) -> int:
        return self._col.count_documents({"user_id": user_id})

    # ── Delete ───────────────────────────────────────────────────────

    def delete(self, artifact_id: str) -> bool:
        try:
            result = self._col.delete_one({"_id": ObjectId(artifact_id)})
        except InvalidId:
            return False
        return result.deleted_count == 1

    def delete_by_project(self, project_id: str) -> int:
        result = self._col.delete_many({"project_id": project_id})
        return result.deleted_count
