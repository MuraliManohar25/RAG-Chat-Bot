import logging
from dataclasses import dataclass

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


async def verify_supabase_token(token: str) -> dict:
    if not settings.supabase_jwt_secret:
        raise ValueError("SUPABASE_JWT_SECRET is not configured")

    try:
        payload = jwt.decode(
            token,
            settings.supabase_jwt_secret,
            algorithms=["HS256"],
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
