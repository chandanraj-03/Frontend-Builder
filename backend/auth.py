"""
JWT authentication utilities.

Provides:
  - password hashing / verification  (bcrypt directly)
  - JWT token creation / decoding
  - FastAPI dependency for protected routes
"""

from __future__ import annotations
import os
import bcrypt
from datetime import datetime, timedelta
from typing import Optional

from dotenv import load_dotenv
from jose import JWTError, jwt
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer

# ── Load env ─────────────────────────────────────────────────────────
_env_path = os.path.join(os.path.dirname(__file__), "..", ".env")
load_dotenv(_env_path)

SECRET_KEY  = os.getenv("JWT_SECRET_KEY", "change_me_in_production")
ALGORITHM   = os.getenv("JWT_ALGORITHM", "HS256")
EXPIRE_MINS = int(os.getenv("JWT_ACCESS_TOKEN_EXPIRE_MINUTES", "1440"))

# ── Password hashing ─────────────────────────────────────────────────

def hash_password(plain: str) -> str:
    return bcrypt.hashpw(plain.encode("utf-8"), bcrypt.gensalt()).decode("utf-8")


def verify_password(plain: str, hashed: str) -> bool:
    return bcrypt.checkpw(plain.encode("utf-8"), hashed.encode("utf-8"))


# ── Token utilities ───────────────────────────────────────────────────

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None) -> str:
    payload = data.copy()
    expire = datetime.utcnow() + (expires_delta or timedelta(minutes=EXPIRE_MINS))
    payload.update({"exp": expire, "iat": datetime.utcnow()})
    return jwt.encode(payload, SECRET_KEY, algorithm=ALGORITHM)


def decode_token(token: str) -> dict:
    """Decode and validate a JWT. Raises HTTPException 401 on failure."""
    credentials_exc = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        user_id: str = payload.get("sub")
        if not user_id:
            raise credentials_exc
        return payload
    except JWTError:
        raise credentials_exc


# ── FastAPI dependency ────────────────────────────────────────────────
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/auth/login")


def get_current_user_id(token: str = Depends(oauth2_scheme)) -> str:
    payload = decode_token(token)
    return payload["sub"]
