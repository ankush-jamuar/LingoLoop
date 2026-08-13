# LingoLoop — Backend Service (Phase 1)

FastAPI-powered backend service providing the core API and database infrastructure for LingoLoop.

## Phase 1 Implementation Summary

- **FastAPI** application instance with lifespan health monitoring.
- **SQLAlchemy 2.0 & SQLite** database engine, session management (`get_db`), and declarative `Base`.
- **CORS Middleware** configured to parse comma-separated origins from environment variables (`CORS_ORIGINS`).
- **Health Check Endpoint**: `GET /api/health` returning `{"status": "ok", "service": "lingoloop-api"}`.

> **Note**: Domain models, course content schemas, user progress tracking, and gamification mechanics will be implemented in subsequent phases.

## Directory Structure

```text
backend/
├── app/
│   ├── main.py            # FastAPI entry point, lifespan, CORS, and router registration
│   ├── config.py          # Settings management with pydantic-settings
│   ├── database.py        # SQLite engine, sessionmaker, and Base
│   ├── models/            # SQLAlchemy declarative Base (Phase 1)
│   ├── schemas/           # Pydantic validation schemas (HealthResponse)
│   ├── routes/            # API endpoints (GET /api/health)
│   └── services/          # Business logic layer foundation
├── seed/                  # Future database seeding scripts
└── requirements.txt       # Python package dependencies
```

## Setup & Running Locally

### 1. Install Dependencies
```bash
cd backend
pip install -r requirements.txt
```

### 2. Run the Development Server
```bash
uvicorn app.main:app --reload --port 8000
```

### 3. Verify Health Endpoint
```bash
curl http://localhost:8000/api/health
```
**Expected Response**:
```json
{
  "status": "ok",
  "service": "lingoloop-api"
}
```

Interactive API documentation is accessible at `http://localhost:8000/docs`.
