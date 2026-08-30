#!/bin/bash

# Production Deployment Script for RAG Chatbot

set -e

echo "🚀 Starting production deployment..."

# Backend Deployment
echo "📦 Deploying backend..."
cd backend

# Install dependencies
pip install -r requirements.txt

# Run database migrations (if using Alembic or similar)
# alembic upgrade head

# Start backend with gunicorn (production server)
# gunicorn app.main:app --workers 4 --worker-class uvicorn.workers.UvicornWorker --bind 0.0.0.0:8000

echo "✅ Backend deployment complete"

# Frontend Deployment
echo "🎨 Deploying frontend..."
cd ../frontend

# Install dependencies
npm ci --production=false

# Build for production
npm run build

# Start production server
# npm start

echo "✅ Frontend deployment complete"

echo "🎉 Production deployment complete!"
