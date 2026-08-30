import logging
from dataclasses import dataclass
from uuid import UUID

from sqlalchemy import select, text
from sqlalchemy.ext.asyncio import AsyncSession

from app.config import settings
from app.embeddings.service import embedding_service
from app.models import Document, DocumentChunk

logger = logging.getLogger(__name__)


@dataclass
class RetrievedChunk:
    chunk_id: str
    document_id: str
    document_title: str
    content: str
    page_number: int | None
    relevance_score: float
    metadata: dict | None = None


class RetrievalService:
    async def search(
        self,
        db: AsyncSession,
        query: str,
        department: str | None = None,
        top_k: int | None = None,
        threshold: float | None = None,
    ) -> list[RetrievedChunk]:
        k = top_k or settings.top_k
        min_score = threshold if threshold is not None else settings.similarity_threshold

        try:
            query_embedding = await embedding_service.generate_embedding(query, task_type="retrieval_query")
            embedding_str = "[" + ",".join(str(x) for x in query_embedding) + "]"

            dept_filter = ""
            params: dict = {"embedding": embedding_str, "limit": k * 2}

            if department:
                dept_filter = "AND d.department = :department"
                params["department"] = department

            sql = text(f"""
                SELECT
                    c.id AS chunk_id,
                    c.document_id,
                    d.title AS document_title,
                    c.content,
                    c.page_number,
                    c.metadata,
                    1 - (c.embedding <=> :embedding::vector) AS relevance_score
                FROM document_chunks c
                JOIN documents d ON d.id = c.document_id
                WHERE d.status = 'ready'
                {dept_filter}
                ORDER BY c.embedding <=> :embedding::vector
                LIMIT :limit
            """)

            result = await db.execute(sql, params)
            rows = result.fetchall()

            retrieved: list[RetrievedChunk] = []
            for row in rows:
                score = float(row.relevance_score)
                if score < min_score:
                    continue
                retrieved.append(
                    RetrievedChunk(
                        chunk_id=str(row.chunk_id),
                        document_id=str(row.document_id),
                        document_title=row.document_title,
                        content=row.content,
                        page_number=row.page_number,
                        relevance_score=score,
                        metadata=row.metadata,
                    )
                )

            max_chunks = settings.max_context_chunks
            return retrieved[:max_chunks]
        except Exception as exc:
            logger.warning("Retrieval search failed for query: %s", exc)
            return []

    def build_context(self, chunks: list[RetrievedChunk]) -> str:
        if not chunks:
            return ""

        parts: list[str] = []
        for i, chunk in enumerate(chunks, 1):
            parts.append(
                f"SOURCE {i}\n"
                f"Document: {chunk.document_title}\n"
                f"Page: {chunk.page_number or 'N/A'}\n\n"
                f"{chunk.content}"
            )
        return "\n\n".join(parts)


retrieval_service = RetrievalService()
