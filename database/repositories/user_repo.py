"""
UserRepository — CRUD operations on the 'users' collection.
"""

from __future__ import annotations
from datetime import datetime
from typing import Optional

from bson import ObjectId
from bson.errors import InvalidId
from pymongo.collection import Collection
from pymongo import ASCENDING

from database.connection import get_database


def _to_str_id(doc: dict) -> dict:
    """Convert MongoDB ObjectId to string 'id' field."""
    if doc and "_id" in doc:
        doc["id"] = str(doc.pop("_id"))
    return doc


class UserRepository:
    """All database operations for the users collection."""

    def __init__(self):
        self._col: Collection = get_database()["users"]
        self._indexes_created = False
        try:
            self._ensure_indexes()
            self._indexes_created = True
        except Exception:
            pass  # Atlas temporarily unreachable; indexes created on next success

    # ── Indexes ──────────────────────────────────────────────────────

    def _ensure_indexes(self) -> None:
        self._col.create_index([("email", ASCENDING)], unique=True, background=True)

    # ── Create ───────────────────────────────────────────────────────

    def create(
        self,
        name: str,
        email: str,
        password_hash: str,
        role: str = "user",
    ) -> dict:
        """Insert a new user document and return it."""
        now = datetime.utcnow()
        doc = {
            "name": name,
            "email": email.lower().strip(),
            "password_hash": password_hash,
            "role": role,
            "is_active": True,
            "created_at": now,
            "updated_at": now,
            "last_login": None,
        }
        result = self._col.insert_one(doc)
        doc["id"] = str(result.inserted_id)
        doc.pop("_id", None)
        return doc

    # ── Read ─────────────────────────────────────────────────────────

    def get_by_id(self, user_id: str) -> Optional[dict]:
        try:
            doc = self._col.find_one({"_id": ObjectId(user_id)})
        except InvalidId:
            return None
        return _to_str_id(doc) if doc else None

    def get_by_email(self, email: str) -> Optional[dict]:
        doc = self._col.find_one({"email": email.lower().strip()})
        return _to_str_id(doc) if doc else None

    def email_exists(self, email: str) -> bool:
        return self._col.count_documents({"email": email.lower().strip()}) > 0

    # ── Update ───────────────────────────────────────────────────────

    def update(self, user_id: str, fields: dict) -> Optional[dict]:
        fields["updated_at"] = datetime.utcnow()
        try:
            self._col.update_one({"_id": ObjectId(user_id)}, {"$set": fields})
        except InvalidId:
            return None
        return self.get_by_id(user_id)

    def update_last_login(self, user_id: str) -> None:
        try:
            self._col.update_one(
                {"_id": ObjectId(user_id)},
                {"$set": {"last_login": datetime.utcnow(), "updated_at": datetime.utcnow()}},
            )
        except InvalidId:
            pass

    # ── Delete ───────────────────────────────────────────────────────

    def delete(self, user_id: str) -> bool:
        try:
            result = self._col.delete_one({"_id": ObjectId(user_id)})
        except InvalidId:
            return False
        return result.deleted_count == 1

    # ── Stats ─────────────────────────────────────────────────────────

    def count_total(self) -> int:
        return self._col.count_documents({})

    def count_active(self) -> int:
        return self._col.count_documents({"is_active": True})
