# LingoLoop — Backend Service (Phase 2)

FastAPI-powered backend service providing the domain model, relational SQLite database architecture, and curriculum seed dataset for LingoLoop.

## Phase 2 Implementation Summary

- **SQLAlchemy 2.x & SQLite Domain Models**:
  - **Curriculum Hierarchy**: `Course` → `Unit` → `Skill` → `Lesson` → `Exercise`, with explicit `order_index` ordering and composite unique constraints on `(parent_id, order_index)`.
  - **Exercise JSON Schema**: Flexible structured JSON column with strict Pydantic validation supporting 5 exercise types: `multiple_choice`, `translate`, `match_pairs`, `fill_blank`, `type_answer`.
  - **Learner & State Tracking**: `User`, `LearnerStats` (`total_xp`, streaks, hearts, gems), `UserSkillProgress` (tracks distinct lessons completed and crown level), and `DailyActivity` (tracks daily minutes, XP, and streaks).
  - **Session & Attempt History**: `LessonAttempt` (tracks lesson-level completion, hearts lost, score, and timestamps) and `ExerciseAttempt` (tracks answer submission, correctness, and attempt number).
  - **Milestones**: `Achievement` and `UserAchievement`.
- **Derived Leaderboard Decision**: No redundant `Leaderboard` table is stored; leaderboard views are derived dynamically from learner statistics.
- **Backend Progression Rules**: Lesson completion advances skill progress on distinct lessons; completing all lessons in a skill advances `crown_level` and unlocks the subsequent skill in the sequence.
- **Idempotent Seed Script**: Seeds *Spanish for English Speakers* with 3 Units, 9 Skills, 18 Lessons, 90 Exercises, and learner **Ankush** with coherent progress history.

---

## Directory Structure

```text
backend/
├── app/
│   ├── main.py            # FastAPI entry point, lifespan, CORS, and table creation
│   ├── config.py          # Settings management with pydantic-settings
│   ├── database.py        # SQLite engine, sessionmaker, Base, and get_db
│   ├── models/            # SQLAlchemy 2.0 domain models
│   │   ├── __init__.py    # Model exports
│   │   ├── base.py        # Declarative Base
│   │   ├── course.py      # Course, Unit, Skill, Lesson, Exercise
│   │   ├── user.py        # User, LearnerStats
│   │   ├── progress.py    # UserSkillProgress, DailyActivity
│   │   ├── attempt.py     # LessonAttempt, ExerciseAttempt
│   │   └── achievement.py # Achievement, UserAchievement
│   ├── schemas/           # Pydantic schemas & typed exercise content validators
│   │   ├── __init__.py
│   │   ├── health.py
│   │   └── exercise_content.py
│   ├── routes/            # API endpoints (GET /api/health)
│   └── services/          # Business logic layer foundation
├── seed/                  # Idempotent database seed scripts
│   ├── __init__.py
│   ├── seed.py            # Main seed script
│   └── README.md
├── requirements.txt       # Python package dependencies
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

### 4. Verify Health Endpoint
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
Interactive Swagger documentation is available at `http://localhost:8000/docs`.
