import logging
import uuid
from pathlib import PurePosixPath

from sqlalchemy import delete, select
from sqlalchemy.ext.asyncio import AsyncSession
from supabase import create_client

from app.config import settings
from app.embeddings.service import embedding_service
from app.ingestion.chunker import chunk_pages
from app.ingestion.pdf_extractor import extract_text_from_pdf
from app.models import Document, DocumentChunk

logger = logging.getLogger(__name__)

ALLOWED_EXTENSIONS = {".pdf", ".txt"}
ALLOWED_MIME_TYPES = {"application/pdf", "text/plain"}


def get_supabase_client():
    if not settings.supabase_url or not settings.supabase_service_role_key:
        raise RuntimeError("Supabase credentials not configured")
    return create_client(settings.supabase_url, settings.supabase_service_role_key)


def safe_filename(filename: str) -> str:
    name = PurePosixPath(filename).name
    return name.replace("..", "").replace("/", "").replace("\\", "")


class DocumentProcessor:
    async def process_document(self, db: AsyncSession, document_id: uuid.UUID) -> None:
        result = await db.execute(select(Document).where(Document.id == document_id))
        document = result.scalar_one_or_none()
        if not document:
            raise ValueError("Document not found")

        try:
            document.status = "processing"
            document.error_message = None
            await db.flush()

            supabase = get_supabase_client()
            file_response = supabase.storage.from_(settings.supabase_storage_bucket).download(
                document.storage_path
            )
            file_bytes = file_response

            if document.filename.lower().endswith(".pdf"):
                pages = extract_text_from_pdf(file_bytes)
            elif document.filename.lower().endswith(".txt"):
                from app.ingestion.pdf_extractor import PageText, clean_text

                text_content = clean_text(file_bytes.decode("utf-8", errors="ignore"))
                pages = [PageText(page_number=1, text=text_content)]
            else:
                raise ValueError("Unsupported file format")

            document.page_count = len(pages)
            await db.flush()

            chunks = chunk_pages(pages)
            if not chunks:
                raise ValueError("No chunks created from document")

            await db.execute(delete(DocumentChunk).where(DocumentChunk.document_id == document_id))

            texts = [c.content for c in chunks]
            embeddings = await embedding_service.generate_embeddings_batch(texts)

            for chunk, embedding in zip(chunks, embeddings):
                db.add(
                    DocumentChunk(
                        document_id=document_id,
                        chunk_index=chunk.chunk_index,
                        content=chunk.content,
                        page_number=chunk.page_number,
                        embedding=embedding,
                        chunk_metadata={
                            "document_id": str(document_id),
                            "page": chunk.page_number,
                            "chunk_index": chunk.chunk_index,
                            "department": document.department,
                            "document_type": document.document_type,
                        },
                    )
                )

            document.chunk_count = len(chunks)
            document.status = "ready"
            document.error_message = None
            await db.flush()
            logger.info("Document %s indexed with %d chunks", document_id, len(chunks))

        except Exception as exc:
            logger.exception("Failed to process document %s", document_id)
            document.status = "failed"
            document.error_message = str(exc)
            await db.flush()
            raise


document_processor = DocumentProcessor()


class DocumentService:
    async def upload_document(
        self,
        db: AsyncSession,
        file_bytes: bytes,
        filename: str,
        title: str,
        uploaded_by: uuid.UUID,
        description: str | None = None,
        department: str | None = None,
        document_type: str | None = None,
        version: str | None = None,
    ) -> Document:
        safe_name = safe_filename(filename)
        ext = PurePosixPath(safe_name).suffix.lower()

        if ext not in ALLOWED_EXTENSIONS:
            raise ValueError(f"Unsupported file type. Allowed: {', '.join(ALLOWED_EXTENSIONS)}")

        max_bytes = settings.max_upload_size_mb * 1024 * 1024
        if len(file_bytes) > max_bytes:
            raise ValueError(f"File exceeds maximum size of {settings.max_upload_size_mb}MB")

        if len(file_bytes) == 0:
            raise ValueError("File is empty")

        doc_id = uuid.uuid4()
        storage_path = f"{doc_id}/{safe_name}"

        supabase = get_supabase_client()
        content_type = "application/pdf" if ext == ".pdf" else "text/plain"
        supabase.storage.from_(settings.supabase_storage_bucket).upload(
            storage_path,
            file_bytes,
            {"content-type": content_type, "upsert": "false"},
        )

        document = Document(
            id=doc_id,
            title=title,
            filename=safe_name,
            storage_path=storage_path,
            description=description,
            department=department,
            document_type=document_type,
            version=version,
            uploaded_by=uploaded_by,
            status="processing",
            file_size=len(file_bytes),
        )
        db.add(document)
        await db.flush()

        await document_processor.process_document(db, doc_id)
        await db.refresh(document)
        return document

    async def delete_document(self, db: AsyncSession, document_id: uuid.UUID) -> None:
        result = await db.execute(select(Document).where(Document.id == document_id))
        document = result.scalar_one_or_none()
        if not document:
            raise ValueError("Document not found")

        try:
            supabase = get_supabase_client()
            supabase.storage.from_(settings.supabase_storage_bucket).remove([document.storage_path])
        except Exception as exc:
            logger.warning("Failed to delete storage file: %s", exc)

        await db.execute(delete(DocumentChunk).where(DocumentChunk.document_id == document_id))
        await db.delete(document)
        await db.flush()

    async def archive_document(self, db: AsyncSession, document_id: uuid.UUID) -> Document:
        result = await db.execute(select(Document).where(Document.id == document_id))
        document = result.scalar_one_or_none()
        if not document:
            raise ValueError("Document not found")
        document.status = "archived"
        await db.flush()
        return document


document_service = DocumentService()
