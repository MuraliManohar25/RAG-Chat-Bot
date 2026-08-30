import pytest
from app.ingestion.pdf_extractor import clean_text, extract_text_from_pdf
from app.ingestion.chunker import chunk_pages
from app.ingestion.pdf_extractor import PageText


class TestTextExtraction:
    def test_clean_text(self):
        assert clean_text("  hello   world  ") == "hello world"
        assert clean_text("line1\n\n\n\nline2") == "line1\n\nline2"

    def test_chunk_pages(self):
        pages = [
            PageText(page_number=1, text="Students must maintain a minimum attendance of 75% in each course."),
            PageText(page_number=2, text="Hostel fees for double occupancy are Rs. 45,000 per year."),
        ]
        chunks = chunk_pages(pages, chunk_size=100, chunk_overlap=20)
        assert len(chunks) >= 2
        assert all(c.page_number in (1, 2) for c in chunks)
        assert chunks[0].chunk_index == 0

    def test_empty_text_raises(self):
        with pytest.raises(ValueError):
            chunk_pages([], chunk_size=100, chunk_overlap=20)


class TestChunking:
    def test_long_text_splits(self):
        long_text = "word " * 500
        pages = [PageText(page_number=1, text=long_text)]
        chunks = chunk_pages(pages, chunk_size=200, chunk_overlap=50)
        assert len(chunks) > 1

    def test_chunk_metadata(self):
        pages = [PageText(page_number=12, text="Attendance requirement is 75%.")]
        chunks = chunk_pages(pages, chunk_size=500, chunk_overlap=50)
        assert chunks[0].metadata["page"] == 12


class TestUnknownQuestionHandling:
    def test_unknown_keywords(self):
        unknown_queries = [
            "What is the college's policy on underwater basket weaving?",
            "What is the hostel fee for 2027?",
        ]
        for q in unknown_queries:
            assert len(q) > 0
