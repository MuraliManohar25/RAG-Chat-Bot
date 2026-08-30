# Production Deployment Guide

This guide covers deploying the RAG Chatbot to production environments.

## Prerequisites

- Supabase project with database, auth, and storage configured
- Gemini API key
- Domain name (optional)
- Deployment platform account (Railway, Render, Vercel, Netlify, etc.)

## Environment Variables

### Production Environment Variables

Set these in your production environment:

```env
ENVIRONMENT=production

# Supabase (Frontend)
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
NEXT_PUBLIC_API_URL=https://your-backend-url.com

# Supabase (Backend)
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
SUPABASE_JWT_SECRET=your_jwt_secret

# Database
DATABASE_URL=postgresql+asyncpg://postgres:password@db.supabase.co:5432/postgres

# Gemini
GEMINI_API_KEY=your_gemini_api_key
GEMINI_EMBEDDING_MODEL=models/text-embedding-004
GEMINI_CHAT_MODEL=models/gemini-2.5-flash

# RAG Configuration
VECTOR_DIMENSION=768
CHUNK_SIZE=800
CHUNK_OVERLAP=150
TOP_K=8
MAX_CONTEXT_CHUNKS=5
SIMILARITY_THRESHOLD=0.35

# Storage
SUPABASE_STORAGE_BUCKET=documents
MAX_UPLOAD_SIZE_MB=25

# CORS (Update with your frontend domain)
CORS_ORIGINS=https://your-frontend-domain.com
```

## Deployment Options

### Option 1: Railway (Recommended for Backend)

**Backend Deployment:**

1. Create a new Railway project
2. Connect your GitHub repository
3. Set environment variables in Railway dashboard
4. Railway will auto-detect the Dockerfile and deploy

**Frontend Deployment:**

1. Create a new Railway project for frontend
2. Connect your GitHub repository
3. Set environment variables
4. Railway will auto-detect Next.js and deploy

### Option 2: Render

**Backend Deployment:**

1. Create a new Web Service on Render
2. Connect your GitHub repository
3. Build command: `cd backend && pip install -r requirements.txt`
4. Start command: `gunicorn app.main:app --workers 4 --worker-class uvicorn.workers.UvicornWorker --bind 0.0.0.0:$PORT`
5. Set environment variables
6. Deploy

**Frontend Deployment:**

1. Create a new Web Service on Render for frontend
2. Build command: `cd frontend && npm run build`
3. Start command: `npm start`
4. Set environment variables
5. Deploy

### Option 3: Docker + Any Cloud Provider

**Build and Push Backend:**

```bash
cd backend
docker build -t your-registry/rag-chatbot-backend:latest .
docker push your-registry/rag-chatbot-backend:latest
```

**Build and Push Frontend:**

```bash
cd frontend
docker build -t your-registry/rag-chatbot-frontend:latest .
docker push your-registry/rag-chatbot-frontend:latest
```

**Run with Docker Compose:**

```yaml
version: '3.8'
services:
  backend:
    image: your-registry/rag-chatbot-backend:latest
    ports:
      - "8000:8000"
    environment:
      - ENVIRONMENT=production
      # Add other env vars
  
  frontend:
    image: your-registry/rag-chatbot-frontend:latest
    ports:
      - "3000:3000"
    environment:
      - NEXT_PUBLIC_API_URL=https://your-backend-url.com
```

### Option 4: Vercel (Frontend) + Railway (Backend)

**Frontend on Vercel:**

1. Import your project to Vercel
2. Set environment variables in Vercel dashboard
3. Vercel will auto-detect Next.js and deploy
4. Update `NEXT_PUBLIC_API_URL` to point to your backend

**Backend on Railway:**

Follow Railway deployment steps above

## Database Setup

1. Enable pgvector extension in Supabase:
   ```sql
   CREATE EXTENSION IF NOT EXISTS vector;
   ```

2. Run the migration:
   ```sql
   -- Copy contents from supabase/migrations/001_initial_schema.sql
   ```

3. Create storage bucket:
   - Go to Supabase Storage
   - Create bucket named `documents`

## Post-Deployment Checklist

- [ ] Set `ENVIRONMENT=production` in backend
- [ ] Update `CORS_ORIGINS` to include your frontend domain
- [ ] Update `NEXT_PUBLIC_API_URL` in frontend to point to production backend
- [ ] Test health endpoint: `https://your-backend.com/health`
- [ ] Test authentication flow
- [ ] Test document upload
- [ ] Test chat functionality
- [ ] Verify API docs are disabled in production (check `/docs` returns 404)
- [ ] Set up monitoring/logging
- [ ] Configure SSL certificates
- [ ] Set up backup strategy for database

## Monitoring

### Health Check

Backend includes a health check endpoint:
```
GET /health
```

Returns:
```json
{
  "status": "ok",
  "environment": "production"
}
```

### Logging

Production logs are configured to INFO level. Check your deployment platform's logs for:
- Application errors
- API request logs
- Database connection issues

## Scaling

### Backend Scaling

- **Horizontal Scaling**: Deploy multiple instances behind a load balancer
- **Vertical Scaling**: Increase worker count in gunicorn command
- **Database**: Supabase handles database scaling automatically

### Frontend Scaling

- Next.js standalone output is optimized for edge deployment
- Vercel/Railway handle automatic scaling

## Security

- API keys are stored in environment variables
- Service role key is only used on backend
- JWT secret is only used on backend
- CORS is configured to only allow specified origins
- API documentation is disabled in production
- Row Level Security (RLS) is enabled on Supabase tables

## Troubleshooting

### Backend won't start
- Check environment variables are set correctly
- Verify database connection string
- Check logs for specific error messages

### Frontend can't connect to backend
- Verify `NEXT_PUBLIC_API_URL` is correct
- Check CORS configuration on backend
- Ensure backend is running and accessible

### Database connection errors
- Verify `DATABASE_URL` is correct
- Check Supabase project is active
- Ensure pgvector extension is enabled

### Embedding dimension mismatch
- Ensure `VECTOR_DIMENSION=768` matches Gemini embedding model
- Re-run database migration if needed

## Cost Optimization

- Use Supabase free tier for development/small deployments
- Gemini API costs scale with usage - monitor token consumption
- Consider caching frequently asked questions
- Implement rate limiting for API endpoints

## Backup Strategy

- Supabase provides automatic database backups
- Document storage in Supabase is automatically replicated
- Export important conversations/documents regularly if needed
