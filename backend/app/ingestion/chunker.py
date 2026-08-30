from dataclasses import dataclass

from app.config import settings
from app.ingestion.pdf_extractor import PageText


@dataclass
class TextChunk:
    chunk_index: int
    content: str
    page_number: int
    metadata: dict


def chunk_pages(
    pages: list[PageText],
    chunk_size: int | None = None,
    chunk_overlap: int | None = None,
) -> list[TextChunk]:
    size = chunk_size or settings.chunk_size
    overlap = chunk_overlap or settings.chunk_overlap
    if overlap >= size:
        overlap = max(0, size // 4)

    chunks: list[TextChunk] = []
    chunk_index = 0

    for page in pages:
        text = page.text
        page_num = page.page_number

        if len(text) <= size:
            chunks.append(
                TextChunk(
                    chunk_index=chunk_index,
                    content=text,
                    page_number=page_num,
                    metadata={"page": page_num},
                )
            )
            chunk_index += 1
            continue

        start = 0
        while start < len(text):
            end = min(start + size, len(text))
            if end < len(text):
                break_point = text.rfind(" ", start, end)
                if break_point > start + size // 2:
                    end = break_point

            chunk_text = text[start:end].strip()
            if chunk_text:
                chunks.append(
                    TextChunk(
                        chunk_index=chunk_index,
                        content=chunk_text,
                        page_number=page_num,
                        metadata={"page": page_num},
                    )
                )
                chunk_index += 1

            if end >= len(text):
                break
            start = max(end - overlap, start + 1)

    return chunks
