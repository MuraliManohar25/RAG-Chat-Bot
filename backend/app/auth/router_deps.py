import logging
from typing import Any

from fastapi import Depends, Header, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession

from app.auth.dependencies import AuthUser, authenticate_request, require_role
from app.database import get_db

logger = logging.getLogger(__name__)


async def get_current_user(
    authorization: str | None = Header(default=None),
    db: AsyncSession = Depends(get_db),
) -> AuthUser:
    try:
        return await authenticate_request(db, authorization)
    except ValueError as exc:
        raise HTTPException(status_code=401, detail=str(exc)) from exc


async def get_admin_user(user: AuthUser = Depends(get_current_user)) -> AuthUser:
    try:
        require_role(user, ["admin"])
    except PermissionError as exc:
        raise HTTPException(status_code=403, detail=str(exc)) from exc
    return user


async def get_student_user(user: AuthUser = Depends(get_current_user)) -> AuthUser:
    try:
        require_role(user, ["student", "admin"])
    except PermissionError as exc:
        raise HTTPException(status_code=403, detail=str(exc)) from exc
    return user
