"""Database package for Frontend AI Builder — MongoDB Atlas."""

from .connection import db, get_database, ping_database

__all__ = ["db", "get_database", "ping_database"]
