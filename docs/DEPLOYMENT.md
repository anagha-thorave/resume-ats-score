# ResumeIQ — Deployment Guide

This guide covers deployment options for the ResumeIQ full-stack platform.

---

## 1. Local / Single-Server Deployment (FastAPI + Embedded SPA)

The application can run as a unified full-stack server where FastAPI serves both API routes (`/api/*`) and the compiled React frontend (`/`):

### Prerequisites
- Python 3.10+ (or Python 3.14)
- Node.js 18+

### Steps
1. Build the frontend:
   ```bash
   cd frontend
   npm install
   npm run build
   cd ..
   ```

2. Start the FastAPI backend:
   ```bash
   cd backend
   pip install -r requirements.txt
   uvicorn app.main:app --host 0.0.0.0 --port 8000
   ```

3. Access the application in your browser:
   - Application UI: `http://localhost:8000`
   - Interactive API Docs: `http://localhost:8000/docs`

---

## 2. Docker & Docker Compose Deployment

### Single-Command Launch
```bash
docker-compose up --build -d
```

### Services Started
- `backend`: Runs FastAPI on port `8000`
- `frontend`: Runs Nginx on port `3000` (proxies `/api` to backend)

To view logs:
```bash
docker-compose logs -f
```

To stop:
```bash
docker-compose down
```

---

## 3. Production Cloud Deployment (Vercel + Render / Railway)

### Frontend on Vercel
1. Push repository to GitHub.
2. Link the `frontend/` directory to Vercel.
3. Set Framework Preset to **Vite**.
4. Configure Environment Variables:
   - `VITE_API_URL`: Your backend URL (e.g. `https://resumeiq-backend.onrender.com`)
5. Deploy.

### Backend on Render / Railway
1. Create a new Web Service pointing to `backend/`.
2. Build Command: `pip install -r requirements.txt`
3. Start Command: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
4. Configure Environment Variables:
   - `DATABASE_URL`: Your PostgreSQL connection string (Supabase or Render Postgres)
   - `SECRET_KEY`: A cryptographically secure random string
   - `AI_PROVIDER`: `fallback` or `openai`
   - `OPENAI_API_KEY`: (Optional) Your OpenAI key if external LLM generation is desired
   - `CORS_ORIGINS`: `["https://your-frontend.vercel.app"]`
