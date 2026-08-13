# LingoLoop — Backend Service (Phase 3)

FastAPI-powered backend service providing the domain model, relational SQLite database architecture, curriculum seed dataset, and learning-path API layer for LingoLoop.

## Phase 3 Endpoints

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/health` | Service health status |
| `GET` | `/api/courses/active` | Active language course metadata |
| `GET` | `/api/courses/{course_id}/map` | Full **Loop Map** dataset (Units, Skills, Lessons, and learner progression flags) |
| `GET` | `/api/skills/{skill_id}` | Detailed skill metadata, lesson list, and user progress |
| `GET` | `/api/learners/current` | Active learner profile & lifetime `LearnerStats` |
| `GET` | `/api/learners/current/next-lesson` | Deterministically calculates the next recommended lesson for the learner |

---

## Directory Structure

```text
backend/
├── app/
│   ├── main.py            # FastAPI entry point, lifespan, CORS, and table creation
│   ├── config.py          # Settings management with pydantic-settings
│   ├── database.py        # SQLite engine, sessionmaker, Base, and get_db
│   ├── models/            # SQLAlchemy 2.0 domain models (13 entities)
│   ├── schemas/           # Pydantic schemas & response models
│   │   ├── health.py
│   │   ├── exercise_content.py
│   │   ├── learner.py
│   │   ├── course.py
│   │   └── progression.py
│   ├── services/          # Encapsulated business logic layer
│   │   ├── course_service.py
│   │   └── learner_service.py
│   └── routes/            # Modular FastAPI route handlers
│       ├── api.py         # Sub-router aggregator
│       ├── health.py
│       ├── courses.py
│       └── learners.py
├── seed/                  # Idempotent database seed scripts
│   ├── seed.py
│   └── README.md
├── requirements.txt
└── README.md
```

---

## Setup & Running Locally

### 1. Install Dependencies
```bash
cd backend
pip install -r requirements.txt
```

### 2. Seed Database
```bash
python -m seed.seed
```

### 3. Run the Development Server
```bash
uvicorn app.main:app --reload --port 8000
```

Verify endpoints at `http://localhost:8000/docs`.
