import logging

import google.generativeai as genai

from app.config import settings
from app.retrieval.service import RetrievedChunk

logger = logging.getLogger(__name__)

SYSTEM_PROMPT = """You are a college information assistant.

Your task is to answer student questions using ONLY the information provided in the retrieved knowledge-base context.

Rules:
1. Do not invent information.
2. Do not guess college policies.
3. Do not fabricate dates, fees, deadlines, rules, contact details, or academic information.
4. If the retrieved context does not contain enough information to answer the question, clearly state that the information is unavailable in the college knowledge base.
5. Use conversation history only to understand the question.
6. The retrieved knowledge base is the authoritative source for college-specific information.
7. Keep answers clear and concise.
8. Do not include source document names or page numbers in your answer — sources are displayed separately by the application.
9. If multiple sources provide relevant information, synthesize them carefully.
10. Do not claim that a source says something if it does not.

When information is unavailable, respond with:
"I couldn't find enough information about this in the college knowledge base. Please contact the relevant college department or administrator for confirmation."
"""

UNKNOWN_RESPONSE = (
    "I couldn't find enough information about this in the college knowledge base. "
    "Please contact the relevant college department or administrator for confirmation."
)


class LLMService:
    def __init__(self) -> None:
        if settings.gemini_api_key:
            genai.configure(api_key=settings.gemini_api_key)
        self.model = settings.gemini_chat_model

    async def generate_answer(
        self,
        question: str,
        context: str,
        conversation_history: list[dict[str, str]] | None = None,
        has_relevant_context: bool = True,
    ) -> str:
        if not has_relevant_context or not context.strip():
            return UNKNOWN_RESPONSE

        if not settings.gemini_api_key:
            raise RuntimeError("Gemini API key is not configured")

        messages: list[dict[str, str]] = [{"role": "system", "content": SYSTEM_PROMPT}]

        if conversation_history:
            for msg in conversation_history[-6:]:
                messages.append({"role": msg["role"], "content": msg["content"]})

        user_content = (
            f"Retrieved Knowledge Base Context:\n{context}\n\n"
            f"---\n\n"
            f"Student Question: {question}\n\n"
            f"Answer using ONLY the retrieved context above."
        )
        messages.append({"role": "user", "content": user_content})

        # Convert messages to Gemini format
        gemini_messages = []
        for msg in messages:
            if msg["role"] == "system":
                gemini_messages.append({"role": "user", "parts": [msg["content"]]})
                gemini_messages.append({"role": "model", "parts": ["Understood. I will follow these instructions."]})
            elif msg["role"] == "user":
                gemini_messages.append({"role": "user", "parts": [msg["content"]]})
            elif msg["role"] == "assistant":
                gemini_messages.append({"role": "model", "parts": [msg["content"]]})

        model = genai.GenerativeModel(
            self.model,
            generation_config=genai.types.GenerationConfig(
                temperature=0.1,
                max_output_tokens=1024,
            )
        )

        response = await model.generate_content_async(gemini_messages)

        return response.text or UNKNOWN_RESPONSE


llm_service = LLMService()
