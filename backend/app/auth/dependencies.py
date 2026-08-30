import logging
from dataclasses import dataclass
from functools import lru_cache

import httpx
from jose import JWTError, jwt
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.config import settings
from app.models import User

logger = logging.getLogger(__name__)


@dataclass
class AuthUser:
    id: str
    email: str
    role: str
    name: str | None = None


@lru_cache(maxsize=1)
def get_jwks():
    """Fetch and cache Supabase's public JWKS. Cache is process-lifetime;
    if keys rotate, restart the service or add a TTL/refresh strategy."""
    if not settings.supabase_url:
        raise ValueError("SUPABASE_URL is not configured")
    
    jwks_url = f"{settings.supabase_url}/auth/v1/.well-known/jwks.json"
    response = httpx.get(jwks_url, timeout=10)
    response.raise_for_status()
    return response.json()


async def verify_supabase_token(token: str) -> dict:
    """Verify a Supabase-issued JWT using ES256 against the project's JWKS."""
    jwks = get_jwks()
    try:
        unverified_header = jwt.get_unverified_header(token)
    except Exception:
        raise ValueError("Invalid token header")

    kid = unverified_header.get("kid")
    key = next((k for k in jwks["keys"] if k["kid"] == kid), None)
    if key is None:
        # Key rotated since cache was populated — refresh once and retry
        get_jwks.cache_clear()
        jwks = get_jwks()
        key = next((k for k in jwks["keys"] if k["kid"] == kid), None)
        if key is None:
            raise ValueError("Signing key not found in JWKS")

    try:
        payload = jwt.decode(
            token,
            key,
            algorithms=["ES256"],
            audience="authenticated",
        )
        return payload
    except JWTError as exc:
        raise ValueError("Invalid or expired token") from exc


async def get_or_create_user(db: AsyncSession, payload: dict) -> User:
    user_id = payload.get("sub")
    email = payload.get("email", "")
    user_metadata = payload.get("user_metadata") or {}
    name = user_metadata.get("name") or user_metadata.get("full_name")
    role = user_metadata.get("role", "student")

    if not user_id:
        raise ValueError("Token missing user id")

    import uuid

    uid = uuid.UUID(user_id)
    result = await db.execute(select(User).where(User.id == uid))
    user = result.scalar_one_or_none()

    if user:
        if name and user.name != name:
            user.name = name
        if role and user.role != role:
            user.role = role
        return user

    user = User(id=uid, email=email, name=name, role=role)
    db.add(user)
    await db.flush()
    return user


async def authenticate_request(db: AsyncSession, authorization: str | None) -> AuthUser:
    if not authorization or not authorization.startswith("Bearer "):
        raise ValueError("Missing authorization header")

    token = authorization.split(" ", 1)[1]
    payload = await verify_supabase_token(token)
    user = await get_or_create_user(db, payload)

    return AuthUser(id=str(user.id), email=user.email, role=user.role, name=user.name)


def require_role(user: AuthUser, allowed_roles: list[str]) -> None:
    if user.role not in allowed_roles:
        raise PermissionError("Insufficient permissions")
