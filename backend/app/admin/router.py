import uuid
from typing import Annotated

from fastapi import APIRouter, Depends, File, Form, HTTPException, Query, UploadFile
from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.auth.dependencies import AuthUser
from app.auth.router_deps import get_admin_user
from app.database import get_db
from app.documents.schemas import (
    DocumentCreateResponse,
    DocumentResponse,
    DocumentUpdateRequest,
    RetrievalDebugRequest,
    RetrievalDebugResponse,
)
from app.documents.service import document_service
from app.models import Conversation, Document, DocumentChunk, Message, MessageFeedback, User
from app.retrieval.service import retrieval_service

router = APIRouter(prefix="/api/admin", tags=["admin"])


def _doc_response(doc: Document) -> DocumentResponse:
    return DocumentResponse(
        id=str(doc.id),
        title=doc.title,
        filename=doc.filename,
        description=doc.description,
        department=doc.department,
        document_type=doc.document_type,
        version=doc.version,
        status=doc.status,
        file_size=doc.file_size,
        page_count=doc.page_count,
        chunk_count=doc.chunk_count,
        error_message=doc.error_message,
        created_at=doc.created_at.isoformat(),
        updated_at=doc.updated_at.isoformat(),
    )


@router.get("/stats")
async def get_stats(
    user: AuthUser = Depends(get_admin_user),
    db: AsyncSession = Depends(get_db),
):
    total_docs = await db.scalar(select(func.count()).select_from(Document))
    ready_docs = await db.scalar(select(func.count()).select_from(Document).where(Document.status == "ready"))
    failed_docs = await db.scalar(select(func.count()).select_from(Document).where(Document.status == "failed"))
    total_users = await db.scalar(select(func.count()).select_from(User))
    total_conversations = await db.scalar(select(func.count()).select_from(Conversation))
    total_questions = await db.scalar(select(func.count()).select_from(Message).where(Message.role == "user"))
    total_chunks = await db.scalar(select(func.count()).select_from(DocumentChunk))
    positive_feedback = await db.scalar(
        select(func.count()).select_from(MessageFeedback).where(MessageFeedback.feedback == "positive")
    )
    negative_feedback = await db.scalar(
        select(func.count()).select_from(MessageFeedback).where(MessageFeedback.feedback == "negative")
    )

    recent = await db.execute(select(Document).order_by(Document.created_at.desc()).limit(5))
    recent_docs = [_doc_response(d) for d in recent.scalars().all()]

    return {
        "total_documents": total_docs or 0,
        "indexed_documents": ready_docs or 0,
        "failed_documents": failed_docs or 0,
        "total_users": total_users or 0,
        "total_conversations": total_conversations or 0,
        "total_questions": total_questions or 0,
        "total_chunks": total_chunks or 0,
        "positive_feedback": positive_feedback or 0,
        "negative_feedback": negative_feedback or 0,
        "recent_documents": recent_docs,
    }


@router.get("/documents", response_model=list[DocumentResponse])
async def list_documents(
    user: AuthUser = Depends(get_admin_user),
    db: AsyncSession = Depends(get_db),
    search: str | None = Query(None),
    status: str | None = Query(None),
    department: str | None = Query(None),
    document_type: str | None = Query(None),
):
    query = select(Document).order_by(Document.created_at.desc())

    if search:
        query = query.where(
            Document.title.ilike(f"%{search}%") | Document.filename.ilike(f"%{search}%")
        )
    if status:
        query = query.where(Document.status == status)
    if department:
        query = query.where(Document.department == department)
    if document_type:
        query = query.where(Document.document_type == document_type)

    result = await db.execute(query)
    return [_doc_response(d) for d in result.scalars().all()]


@router.get("/documents/{document_id}", response_model=DocumentResponse)
async def get_document(
    document_id: str,
    user: AuthUser = Depends(get_admin_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(select(Document).where(Document.id == uuid.UUID(document_id)))
    doc = result.scalar_one_or_none()
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found")
    return _doc_response(doc)


@router.post("/documents", response_model=DocumentCreateResponse)
async def upload_document(
    file: Annotated[UploadFile, File()],
    title: Annotated[str, Form()],
    description: Annotated[str | None, Form()] = None,
    department: Annotated[str | None, Form()] = None,
    document_type: Annotated[str | None, Form()] = None,
    version: Annotated[str | None, Form()] = None,
    user: AuthUser = Depends(get_admin_user),
    db: AsyncSession = Depends(get_db),
):
    file_bytes = await file.read()
    try:
        doc = await document_service.upload_document(
            db,
            file_bytes=file_bytes,
            filename=file.filename or "document.pdf",
            title=title,
            uploaded_by=uuid.UUID(user.id),
            description=description,
            department=department,
            document_type=document_type,
            version=version,
        )
        return DocumentCreateResponse(
            id=str(doc.id),
            title=doc.title,
            filename=doc.filename,
            status=doc.status,
            chunk_count=doc.chunk_count,
            page_count=doc.page_count,
            error_message=doc.error_message,
        )
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc
    except Exception as exc:
        raise HTTPException(status_code=500, detail=f"Upload failed: {exc}") from exc


@router.patch("/documents/{document_id}", response_model=DocumentResponse)
async def update_document(
    document_id: str,
    request: DocumentUpdateRequest,
    user: AuthUser = Depends(get_admin_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(select(Document).where(Document.id == uuid.UUID(document_id)))
    doc = result.scalar_one_or_none()
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found")

    for field, value in request.model_dump(exclude_unset=True).items():
        setattr(doc, field, value)
    await db.flush()
    return _doc_response(doc)


@router.delete("/documents/{document_id}")
async def delete_document(
    document_id: str,
    user: AuthUser = Depends(get_admin_user),
    db: AsyncSession = Depends(get_db),
):
    try:
        await document_service.delete_document(db, uuid.UUID(document_id))
        return {"success": True}
    except ValueError as exc:
        raise HTTPException(status_code=404, detail=str(exc)) from exc


@router.post("/documents/{document_id}/archive", response_model=DocumentResponse)
async def archive_document(
    document_id: str,
    user: AuthUser = Depends(get_admin_user),
    db: AsyncSession = Depends(get_db),
):
    try:
        doc = await document_service.archive_document(db, uuid.UUID(document_id))
        return _doc_response(doc)
    except ValueError as exc:
        raise HTTPException(status_code=404, detail=str(exc)) from exc


@router.get("/documents/{document_id}/chunks")
async def get_document_chunks(
    document_id: str,
    user: AuthUser = Depends(get_admin_user),
    db: AsyncSession = Depends(get_db),
    limit: int = Query(20, le=100),
):
    result = await db.execute(
        select(DocumentChunk)
        .where(DocumentChunk.document_id == uuid.UUID(document_id))
        .order_by(DocumentChunk.chunk_index)
        .limit(limit)
    )
    chunks = result.scalars().all()
    return [
        {
            "id": str(c.id),
            "chunk_index": c.chunk_index,
            "content": c.content[:500],
            "page_number": c.page_number,
            "metadata": c.chunk_metadata,
        }
        for c in chunks
    ]


@router.post("/retrieval/debug", response_model=RetrievalDebugResponse)
async def debug_retrieval(
    request: RetrievalDebugRequest,
    user: AuthUser = Depends(get_admin_user),
    db: AsyncSession = Depends(get_db),
):
    chunks = await retrieval_service.search(
        db, request.query, department=request.department, top_k=request.top_k
    )
    return RetrievalDebugResponse(
        query=request.query,
        chunks=[
            {
                "document_title": c.document_title,
                "page_number": c.page_number,
                "content": c.content[:300],
                "relevance_score": round(c.relevance_score, 3),
                "chunk_id": c.chunk_id,
            }
            for c in chunks
        ],
    )


@router.get("/users")
async def list_users(
    user: AuthUser = Depends(get_admin_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(select(User).order_by(User.created_at.desc()))
    users = result.scalars().all()
    return [
        {
            "id": str(u.id),
            "email": u.email,
            "name": u.name,
            "role": u.role,
            "created_at": u.created_at.isoformat(),
        }
        for u in users
    ]
