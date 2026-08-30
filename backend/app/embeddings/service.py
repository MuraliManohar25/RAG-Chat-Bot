import logging
import re

import google.generativeai as genai

from app.config import settings

logger = logging.getLogger(__name__)


class EmbeddingService:
    def __init__(self) -> None:
        if settings.gemini_api_key:
            genai.configure(api_key=settings.gemini_api_key)
        self.model = settings.gemini_embedding_model
        self.dimension = settings.vector_dimension

    async def generate_embedding(self, text: str, task_type: str = "retrieval_query") -> list[float]:
        if not settings.gemini_api_key:
            raise RuntimeError("Gemini API key is not configured")

        cleaned = re.sub(r"\s+", " ", text.strip())
        if not cleaned:
            raise ValueError("Cannot embed empty text")

        response = genai.embed_content(
            model=self.model,
            content=cleaned,
            task_type=task_type,
        )
        embedding = response['embedding']

        if len(embedding) != self.dimension:
            raise ValueError(
                f"Embedding dimension mismatch: expected {self.dimension}, got {len(embedding)}"
            )

        return embedding

    async def generate_embeddings_batch(self, texts: list[str], batch_size: int = 50) -> list[list[float]]:
        results: list[list[float]] = []
        for i in range(0, len(texts), batch_size):
            batch = texts[i : i + batch_size]
            cleaned_batch = [re.sub(r"\s+", " ", t.strip()) for t in batch]
            response = genai.embed_content(
                model=self.model,
                content=cleaned_batch,
                task_type="retrieval_document",
            )
            batch_embeddings = response['embedding']
            results.extend(batch_embeddings)
        return results


embedding_service = EmbeddingService()
