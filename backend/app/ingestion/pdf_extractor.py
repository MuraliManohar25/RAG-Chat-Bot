import logging
import re
from dataclasses import dataclass

import fitz

logger = logging.getLogger(__name__)


@dataclass
class PageText:
    page_number: int
    text: str


def clean_text(text: str) -> str:
    text = text.replace("\x00", "")
    text = re.sub(r"[ \t]+", " ", text)
    text = re.sub(r"\n{3,}", "\n\n", text)
    return text.strip()


def extract_text_from_pdf(file_bytes: bytes) -> list[PageText]:
    pages: list[PageText] = []
    try:
        doc = fitz.open(stream=file_bytes, filetype="pdf")
    except Exception as exc:
        raise ValueError(f"Failed to open PDF: {exc}") from exc

    if doc.page_count == 0:
        raise ValueError("PDF contains no pages")

    for page_index in range(doc.page_count):
        page = doc.load_page(page_index)
        raw_text = page.get_text("text")
        cleaned = clean_text(raw_text)
        if cleaned:
            pages.append(PageText(page_number=page_index + 1, text=cleaned))

    doc.close()

    if not pages:
        raise ValueError("No extractable text found in PDF")

    return pages
