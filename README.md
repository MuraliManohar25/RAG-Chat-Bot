# College AI Assistant — RAG-Based College Information Chatbot

An AI-powered college information assistant that answers student questions using **real Retrieval-Augmented Generation (RAG)** over uploaded college documents.

```
Documents → Text Extraction → Chunking → Embeddings → pgvector → Retrieval → LLM → Answer + Sources
```

## Features

- **Real RAG pipeline** — no hardcoded answers; every response is grounded in retrieved document chunks
- **Neumorphic UI** — tactile soft-UI design system across student and admin experiences
- **Document ingestion** — admin PDF upload with processing status tracking
- **Vector search** — PostgreSQL + pgvector semantic similarity search
- **Source citations** — page numbers and document titles from actual retrieved chunks
- **Conversation history** — persistent chat with follow-up question support
- **Role-based access** — student vs admin authorization enforced on backend
- **Admin dashboard** — document management, analytics, retrieval debugging
- **Feedback system** — thumbs up/down on assistant responses

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Next.js 16, React 19, TypeScript, Tailwind CSS v4 |
| Backend | FastAPI, Python 3.11+ |
| Database | PostgreSQL + pgvector |
| Auth | Supabase Auth |
| Storage | Supabase Storage |
| Embeddings | Google Gemini `text-embedding-004` |
| LLM | Google Gemini `gemini-1.5-flash` |
| PDF Processing | PyMuPDF (fitz) |

## Architecture

```
Student/Admin → Next.js Frontend → FastAPI Backend
                                        ├── Supabase Auth
                                        ├── Document Upload → Supabase Storage
                                        ├── PDF Extraction (PyMuPDF)
                                        ├── Chunking + Embeddings (Gemini)
                                        ├── pgvector Similarity Search
                                        └── LLM Generation (Gemini)
```

## Project Structure

```
RAG chatbot/
├── frontend/          # Next.js app (neumorphic UI)
├── backend/           # FastAPI RAG API
│   ├── app/
│   │   ├── auth/      # Supabase JWT verification
│   │   ├── chat/      # Chat & conversations
│   │   ├── admin/     # Admin endpoints
│   │   ├── documents/ # Document management
│   │   ├── ingestion/ # PDF extraction & chunking
│   │   ├── embeddings/# Gemini embeddings
│   │   ├── retrieval/ # pgvector search
│   │   └── llm/       # Gemini chat completion
│   └── tests/
├── supabase/
│   └── migrations/    # Database schema + RLS
├── sample-documents/  # Test college documents
└── .env.example
```

## Setup

### Prerequisites

- Node.js 18+
- Python 3.11+
- PostgreSQL with pgvector extension
- Supabase project (Auth + Storage + Database)
- Google Gemini API key

### 1. Database Setup

Run the migration in Supabase SQL Editor or via CLI:

```bash
# Apply migration
psql $DATABASE_URL -f supabase/migrations/001_initial_schema.sql
```

Create a storage bucket named `documents` in Supabase Storage.

### 2. Backend Setup

```bash
cd backend
python -m venv venv
venv\Scripts\activate        # Windows
pip install -r requirements.txt
cp ..\.env.example .env      # Fill in your credentials
uvicorn app.main:app --reload --port 8000
```

### 3. Frontend Setup

```bash
cd frontend
npm install
cp .env.example .env.local
npm run dev
```

Set `NEXT_PUBLIC_USE_MOCK_API=true` in `.env.local` to run the UI without a backend.

### 4. Generate Sample PDFs

```bash
cd backend
python scripts/generate_sample_pdfs.py
```

Upload the generated PDFs from `sample-documents/pdf/` via the admin dashboard.

## Environment Variables

| Variable | Description |
|----------|-------------|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anon key (client-safe) |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase service role key (backend only) |
| `SUPABASE_JWT_SECRET` | JWT secret for token verification |
| `DATABASE_URL` | PostgreSQL connection string (asyncpg) |
| `GEMINI_API_KEY` | Google Gemini API key |
| `GEMINI_EMBEDDING_MODEL` | Embedding model (default: models/text-embedding-004) |
| `GEMINI_CHAT_MODEL` | Chat model (default: models/gemini-1.5-flash) |
| `VECTOR_DIMENSION` | Embedding dimensions (default: 768) |
| `CHUNK_SIZE` | Text chunk size (default: 800) |
| `CHUNK_OVERLAP` | Chunk overlap (default: 150) |
| `TOP_K` | Max chunks to retrieve (default: 8) |
| `SIMILARITY_THRESHOLD` | Min relevance score (default: 0.35) |

## Admin Setup

1. Create a user via Supabase Auth (signup page)
2. In Supabase Dashboard → Authentication → Users, edit the user's metadata:
   ```json
   { "role": "admin", "name": "Admin User" }
   ```
3. Log in and access `/admin`

## RAG Pipeline

1. **Upload**: Admin uploads PDF → stored in Supabase Storage
2. **Extract**: PyMuPDF extracts text page-by-page with page numbers
3. **Chunk**: Text split into configurable chunks with overlap
4. **Embed**: Gemini generates embeddings for each chunk
5. **Store**: Chunks + embeddings saved to PostgreSQL with pgvector
6. **Query**: Student question → embedded → cosine similarity search
7. **Filter**: Chunks below similarity threshold are excluded
8. **Generate**: Retrieved context + question sent to LLM with strict system prompt
9. **Sources**: Backend returns structured source metadata separately from LLM text

## API Endpoints

```
POST   /api/chat                              Send message (RAG)
GET    /api/chat/conversations                List conversations
GET    /api/chat/conversations/:id            Get conversation
DELETE /api/chat/conversations/:id            Delete conversation
POST   /api/chat/messages/:id/feedback        Submit feedback

POST   /api/admin/documents                   Upload document
GET    /api/admin/documents                   List documents
GET    /api/admin/documents/:id               Get document
PATCH  /api/admin/documents/:id               Update document
DELETE /api/admin/documents/:id               Delete document
GET    /api/admin/stats                       Dashboard stats
POST   /api/admin/retrieval/debug             Debug retrieval
GET    /api/admin/users                       List users
```

## Testing

```bash
cd backend
pytest tests/ -v
```

## Deployment

| Component | Platform |
|-----------|----------|
| Frontend | Netlify |
| Backend | Railway / Render / Fly.io |
| Database | Supabase PostgreSQL |
| Auth | Supabase Auth |
| Storage | Supabase Storage |

### Netlify Frontend

```bash
cd frontend
npm run build
# Deploy to Netlify with build command: npm run build
# Publish directory: .next (or use @netlify/plugin-nextjs)
```

Set environment variables in Netlify dashboard. Point `NEXT_PUBLIC_API_URL` to your deployed backend.

## Troubleshooting

| Issue | Solution |
|-------|----------|
| "Invalid token" | Check `SUPABASE_JWT_SECRET` matches Supabase project |
| Embedding dimension mismatch | Ensure `VECTOR_DIMENSION=1536` matches migration |
| No search results | Upload documents first; check similarity threshold |
| Upload fails | Verify Supabase Storage bucket `documents` exists |
| Mock mode | Set `NEXT_PUBLIC_USE_MOCK_API=true` for UI-only development |

## License

MIT
