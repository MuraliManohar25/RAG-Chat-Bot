from uuid import UUID

from pydantic import BaseModel, Field


class DocumentCreateResponse(BaseModel):
    id: str
    title: str
    filename: str
    status: str
    chunk_count: int | None = None
    page_count: int | None = None
    error_message: str | None = None


class DocumentResponse(BaseModel):
    id: str
    title: str
    filename: str
    description: str | None = None
    department: str | None = None
    document_type: str | None = None
    version: str | None = None
    status: str
    file_size: int | None = None
    page_count: int | None = None
    chunk_count: int | None = None
    error_message: str | None = None
    created_at: str
    updated_at: str


class DocumentUpdateRequest(BaseModel):
    title: str | None = None
    description: str | None = None
    department: str | None = None
    document_type: str | None = None
    version: str | None = None
    status: str | None = None


class RetrievalDebugRequest(BaseModel):
    query: str = Field(..., min_length=1)
    department: str | None = None
    top_k: int | None = None


class RetrievalDebugResponse(BaseModel):
    query: str
    chunks: list[dict]
