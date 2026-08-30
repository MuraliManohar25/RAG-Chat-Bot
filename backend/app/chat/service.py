import logging
import uuid

from sqlalchemy import delete, func, select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.llm.service import UNKNOWN_RESPONSE, llm_service
from app.models import Conversation, Message, MessageFeedback, MessageSource
from app.retrieval.service import retrieval_service

logger = logging.getLogger(__name__)


class ChatService:
    async def create_conversation(self, db: AsyncSession, user_id: uuid.UUID, title: str = "New Conversation") -> Conversation:
        conversation = Conversation(user_id=user_id, title=title)
        db.add(conversation)
        await db.flush()
        return conversation

    async def get_conversations(self, db: AsyncSession, user_id: uuid.UUID) -> list[Conversation]:
        result = await db.execute(
            select(Conversation)
            .where(Conversation.user_id == user_id)
            .order_by(Conversation.updated_at.desc())
        )
        return list(result.scalars().all())

    async def get_conversation(
        self, db: AsyncSession, conversation_id: uuid.UUID, user_id: uuid.UUID
    ) -> Conversation | None:
        result = await db.execute(
            select(Conversation)
            .options(selectinload(Conversation.messages).selectinload(Message.sources))
            .where(Conversation.id == conversation_id, Conversation.user_id == user_id)
        )
        return result.scalar_one_or_none()

    async def delete_conversation(self, db: AsyncSession, conversation_id: uuid.UUID, user_id: uuid.UUID) -> bool:
        result = await db.execute(
            select(Conversation).where(Conversation.id == conversation_id, Conversation.user_id == user_id)
        )
        conversation = result.scalar_one_or_none()
        if not conversation:
            return False
        await db.delete(conversation)
        await db.flush()
        return True

    async def send_message(
        self,
        db: AsyncSession,
        user_id: uuid.UUID,
        content: str,
        conversation_id: uuid.UUID | None = None,
        department: str | None = None,
    ) -> dict:
        if not content.strip():
            raise ValueError("Message cannot be empty")

        if conversation_id:
            result = await db.execute(
                select(Conversation)
                .options(selectinload(Conversation.messages))
                .where(Conversation.id == conversation_id, Conversation.user_id == user_id)
            )
            conversation = result.scalar_one_or_none()
            if not conversation:
                raise ValueError("Conversation not found")
        else:
            title = content[:80] + ("..." if len(content) > 80 else "")
            conversation = await self.create_conversation(db, user_id, title)
            conversation_id = conversation.id

        user_message = Message(conversation_id=conversation_id, role="user", content=content.strip())
        db.add(user_message)
        await db.flush()

        history = []
        if conversation.messages:
            for msg in sorted(conversation.messages, key=lambda m: m.created_at)[-6:]:
                history.append({"role": msg.role, "content": msg.content})

        retrieved = await retrieval_service.search(db, content, department=department)
        context = retrieval_service.build_context(retrieved)
        has_context = len(retrieved) > 0

        answer = await llm_service.generate_answer(
            question=content,
            context=context,
            conversation_history=history,
            has_relevant_context=has_context,
        )

        assistant_message = Message(
            conversation_id=conversation_id,
            role="assistant",
            content=answer,
        )
        db.add(assistant_message)
        await db.flush()

        sources = []
        for chunk in retrieved:
            db.add(
                MessageSource(
                    message_id=assistant_message.id,
                    chunk_id=uuid.UUID(chunk.chunk_id),
                    document_id=uuid.UUID(chunk.document_id),
                    page_number=chunk.page_number,
                    relevance_score=chunk.relevance_score,
                )
            )
            sources.append(
                {
                    "document_id": chunk.document_id,
                    "document_title": chunk.document_title,
                    "page_number": chunk.page_number,
                    "chunk_id": chunk.chunk_id,
                    "relevance_score": round(chunk.relevance_score, 3),
                }
            )

        conversation.updated_at = func.now()
        await db.flush()

        return {
            "answer": answer,
            "conversation_id": str(conversation_id),
            "message_id": str(assistant_message.id),
            "sources": sources,
            "has_context": has_context,
        }

    async def submit_feedback(
        self,
        db: AsyncSession,
        message_id: uuid.UUID,
        user_id: uuid.UUID,
        feedback: str,
    ) -> MessageFeedback:
        if feedback not in ("positive", "negative"):
            raise ValueError("Feedback must be 'positive' or 'negative'")

        result = await db.execute(
            select(Message)
            .join(Conversation)
            .where(Message.id == message_id, Conversation.user_id == user_id)
        )
        message = result.scalar_one_or_none()
        if not message:
            raise ValueError("Message not found")

        await db.execute(
            delete(MessageFeedback).where(
                MessageFeedback.message_id == message_id,
                MessageFeedback.user_id == user_id,
            )
        )

        fb = MessageFeedback(message_id=message_id, user_id=user_id, feedback=feedback)
        db.add(fb)
        await db.flush()
        return fb


chat_service = ChatService()
