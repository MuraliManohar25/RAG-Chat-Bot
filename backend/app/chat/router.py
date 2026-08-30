from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession

from app.auth.dependencies import AuthUser
from app.auth.router_deps import get_student_user
from app.chat.schemas import (
    ChatRequest,
    ChatResponse,
    ConversationDetailResponse,
    ConversationResponse,
    FeedbackRequest,
    MessageResponse,
    SourceResponse,
)
from app.chat.service import chat_service
from app.database import get_db

router = APIRouter(prefix="/api/chat", tags=["chat"])


@router.post("", response_model=ChatResponse)
async def send_message(
    request: ChatRequest,
    user: AuthUser = Depends(get_student_user),
    db: AsyncSession = Depends(get_db),
):
    import uuid

    try:
        result = await chat_service.send_message(
            db,
            user_id=uuid.UUID(user.id),
            content=request.message,
            conversation_id=request.conversation_id,
            department=request.department,
        )
        return ChatResponse(
            answer=result["answer"],
            conversation_id=result["conversation_id"],
            message_id=result["message_id"],
            sources=[SourceResponse(**s) for s in result["sources"]],
            has_context=result["has_context"],
        )
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc
    except Exception as exc:
        raise HTTPException(status_code=500, detail="Failed to process message") from exc


@router.get("/conversations", response_model=list[ConversationResponse])
async def list_conversations(
    user: AuthUser = Depends(get_student_user),
    db: AsyncSession = Depends(get_db),
):
    import uuid

    conversations = await chat_service.get_conversations(db, uuid.UUID(user.id))
    return [
        ConversationResponse(
            id=str(c.id),
            title=c.title,
            created_at=c.created_at.isoformat(),
            updated_at=c.updated_at.isoformat(),
        )
        for c in conversations
    ]


@router.get("/conversations/{conversation_id}", response_model=ConversationDetailResponse)
async def get_conversation(
    conversation_id: str,
    user: AuthUser = Depends(get_student_user),
    db: AsyncSession = Depends(get_db),
):
    import uuid

    conversation = await chat_service.get_conversation(db, uuid.UUID(conversation_id), uuid.UUID(user.id))
    if not conversation:
        raise HTTPException(status_code=404, detail="Conversation not found")

    messages = []
    for msg in sorted(conversation.messages, key=lambda m: m.created_at):
        sources = []
        if msg.role == "assistant" and msg.sources:
            from sqlalchemy import select
            from app.models import Document

            for src in msg.sources:
                doc_title = "Unknown"
                if src.document_id:
                    doc_result = await db.execute(select(Document).where(Document.id == src.document_id))
                    doc = doc_result.scalar_one_or_none()
                    if doc:
                        doc_title = doc.title
                sources.append(
                    SourceResponse(
                        document_id=str(src.document_id) if src.document_id else "",
                        document_title=doc_title,
                        page_number=src.page_number,
                        chunk_id=str(src.chunk_id) if src.chunk_id else "",
                        relevance_score=src.relevance_score or 0.0,
                    )
                )
        messages.append(
            MessageResponse(
                id=str(msg.id),
                role=msg.role,
                content=msg.content,
                created_at=msg.created_at.isoformat(),
                sources=sources,
            )
        )

    return ConversationDetailResponse(
        id=str(conversation.id),
        title=conversation.title,
        messages=messages,
        created_at=conversation.created_at.isoformat(),
        updated_at=conversation.updated_at.isoformat(),
    )


@router.delete("/conversations/{conversation_id}")
async def delete_conversation(
    conversation_id: str,
    user: AuthUser = Depends(get_student_user),
    db: AsyncSession = Depends(get_db),
):
    import uuid

    deleted = await chat_service.delete_conversation(db, uuid.UUID(conversation_id), uuid.UUID(user.id))
    if not deleted:
        raise HTTPException(status_code=404, detail="Conversation not found")
    return {"success": True}


@router.post("/messages/{message_id}/feedback")
async def submit_feedback(
    message_id: str,
    request: FeedbackRequest,
    user: AuthUser = Depends(get_student_user),
    db: AsyncSession = Depends(get_db),
):
    import uuid

    try:
        await chat_service.submit_feedback(
            db, uuid.UUID(message_id), uuid.UUID(user.id), request.feedback
        )
        return {"success": True}
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc
