"""
MongoDB Atlas connection manager.

Provides a single shared MongoClient and helper utilities
for pinging the cluster and retrieving the active database.

NOTE: Connection is LAZY — no DNS/network call happens at import time.
"""

import os
import sys
import certifi
from dotenv import load_dotenv
from pymongo import MongoClient
import dns.resolver
from pymongo.errors import ConnectionFailure, ServerSelectionTimeoutError
from colorama import Fore, Style, init

dns.resolver.default_resolver = dns.resolver.Resolver(configure=False)
dns.resolver.default_resolver.nameservers = ['8.8.8.8', '8.8.4.4', '1.1.1.1']

# Initialise colorama for Windows
init()

# ── Load environment variables ──────────────────────────────────────
_env_path = os.path.join(os.path.dirname(__file__), "..", ".env")
load_dotenv(_env_path)

MONGODB_URI     = os.getenv("MONGODB_URI")
MONGODB_DB_NAME = os.getenv("MONGODB_DB_NAME", "transformerDB")

if not MONGODB_URI:
    print(f"{Fore.RED}[DB] WARNING: MONGODB_URI is not set in .env — "
          f"database features will be unavailable.{Style.RESET_ALL}")

# ── Singleton client ─────────────────────────────────────────────────
_client: MongoClient | None = None


def get_client() -> MongoClient:
    """Return (or create) the singleton MongoClient."""
    global _client
    if _client is None:
        if not MONGODB_URI:
            raise ConnectionFailure("MONGODB_URI is not configured in .env")
        _client = MongoClient(
            MONGODB_URI,
            serverSelectionTimeoutMS=5000,
            connectTimeoutMS=5000,
            socketTimeoutMS=10000,
            tlsCAFile=certifi.where(),
        )
    return _client


def get_database():
    """Return the active MongoDB database object."""
    return get_client()[MONGODB_DB_NAME]


class _LazyDB:
    """Proxy that defers MongoClient creation until first attribute access."""
    def __getattr__(self, name):
        return getattr(get_database(), name)
    def __getitem__(self, name):
        return get_database()[name]


# Convenience alias used by repositories — NOW LAZY
db = _LazyDB()


def ping_database() -> bool:
    """
    Ping the MongoDB Atlas cluster.

    Returns True on success, False on failure.
    """
    try:
        get_client().admin.command("ping")
        print(
            f"{Fore.GREEN}[DB] ✓ Connected to MongoDB Atlas "
            f"— database: '{MONGODB_DB_NAME}'{Style.RESET_ALL}"
        )
        return True
    except (ConnectionFailure, ServerSelectionTimeoutError) as exc:
        print(f"{Fore.RED}[DB] ✗ MongoDB connection failed: {exc}{Style.RESET_ALL}")
        return False
    except Exception as exc:
        print(f"{Fore.RED}[DB] ✗ Unexpected error: {exc}{Style.RESET_ALL}")
        return False


def close_connection() -> None:
    """Close the MongoClient (call on application shutdown)."""
    global _client
    if _client:
        _client.close()
        _client = None
        print(f"{Fore.YELLOW}[DB] Connection closed.{Style.RESET_ALL}")
