"""
Repository for the Template collection.
Provides data access methods for templates in MongoDB.
"""

from typing import Optional, List, Dict, Any
from datetime import datetime
from bson import ObjectId
from pymongo import ReturnDocument

from database.connection import db
from database.models.template import TemplateResponse


def doc_to_response(doc: dict) -> TemplateResponse:
    doc["id"] = str(doc.pop("_id"))
    return TemplateResponse(**doc)


class TemplateRepository:
    def __init__(self):
        self.collection = db.templates

    def get_all(self) -> List[TemplateResponse]:
        """Fetch all templates."""
        docs = list(self.collection.find())
        return [doc_to_response(doc) for doc in docs]

    def get_by_key(self, key: str) -> Optional[TemplateResponse]:
        """Fetch a specific template by its unique key."""
        doc = self.collection.find_one({"key": key})
        if doc:
            return doc_to_response(doc)
        return None

    def upsert(self, key: str, data: Dict[str, Any]) -> TemplateResponse:
        """
        Create or update a template using its unique string key.
        """
        now = datetime.utcnow()
        update_doc = {
            "$set": {
                **data,
                "updated_at": now
            },
            "$setOnInsert": {
                "key": key,
                "created_at": now
            }
        }
        doc = self.collection.find_one_and_update(
            {"key": key},
            update_doc,
            upsert=True,
            return_document=ReturnDocument.AFTER
        )
        return doc_to_response(doc)

    def delete(self, key: str) -> bool:
        """Delete a template by its key."""
        result = self.collection.delete_one({"key": key})
        return result.deleted_count > 0
