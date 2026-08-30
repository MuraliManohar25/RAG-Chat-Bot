import logging
import os

from fastapi import Depends, FastAPI, Header, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from sqlalchemy.ext.asyncio import AsyncSession

from app.admin.router import router as admin_router
from app.auth.dependencies import authenticate_request
from app.chat.router import router as chat_router
from app.config import settings
from app.database import get_db

# Configure logging based on environment
log_level = logging.INFO if os.getenv("ENVIRONMENT") == "production" else logging.DEBUG
logging.basicConfig(
    level=log_level,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s"
)
logger = logging.getLogger(__name__)

app = FastAPI(
    title="College RAG Chatbot API",
    description="RAG-based college information assistant backend",
    version="1.0.0",
    docs_url="/docs" if os.getenv("ENVIRONMENT") != "production" else None,
    redoc_url="/redoc" if os.getenv("ENVIRONMENT") != "production" else None,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origin_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    logger.error(f"Unhandled exception: {exc}", exc_info=True)
    return JSONResponse(
        status_code=500,
        content={"detail": "Internal server error"},
    )


app.include_router(chat_router)
app.include_router(admin_router)


@app.get("/health")
async def health():
    return {"status": "ok", "environment": os.getenv("ENVIRONMENT", "development")}


@app.get("/api/me")
async def get_me(
    authorization: str | None = Header(default=None),
    db: AsyncSession = Depends(get_db),
):
    try:
        user = await authenticate_request(db, authorization)
        return {"id": user.id, "email": user.email, "name": user.name, "role": user.role}
    except ValueError as exc:
        raise HTTPException(status_code=401, detail=str(exc)) from exc
