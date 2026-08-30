from uuid import UUID

from pydantic import BaseModel, Field


class ChatRequest(BaseModel):
    message: str = Field(..., min_length=1, max_length=4000)
    conversation_id: UUID | None = None
    department: str | None = None


class SourceResponse(BaseModel):
    document_id: str
    document_title: str
    page_number: int | None = None
    chunk_id: str
    relevance_score: float


class ChatResponse(BaseModel):
    answer: str
    conversation_id: str
    message_id: str
    sources: list[SourceResponse]
    has_context: bool


class FeedbackRequest(BaseModel):
    feedback: str = Field(..., pattern="^(positive|negative)$")


class ConversationResponse(BaseModel):
    id: str
    title: str
    created_at: str
    updated_at: str


class MessageResponse(BaseModel):
    id: str
    role: str
    content: str
    created_at: str
    sources: list[SourceResponse] = []


class ConversationDetailResponse(BaseModel):
    id: str
    title: str
    messages: list[MessageResponse]
    created_at: str
    updated_at: str
