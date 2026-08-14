# LingoLoop — Backend Service

FastAPI-powered backend service providing the domain model, relational SQLite database architecture, curriculum seed dataset, interactive lesson engine, and gamification economy for LingoLoop.

## API Endpoints

### Curriculum & Progression
| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/health` | Service health status |
| `GET` | `/api/courses/active` | Active language course metadata |
| `GET` | `/api/courses/{course_id}/map` | Full **Loop Map** dataset (Units, Skills, Lessons, and learner progression flags) |
| `GET` | `/api/skills/{skill_id}` | Detailed skill metadata, lesson list, and user progress |
| `GET` | `/api/learners/current` | Active learner profile & lifetime `LearnerStats` |
| `GET` | `/api/learners/current/next-lesson` | Deterministically calculates the next recommended lesson for the learner |

### Lesson Engine (Phase 4)
| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/lessons/{lesson_id}/start` | Starts/resumes a lesson attempt session with sanitized exercises |
| `POST` | `/api/lessons/{attempt_id}/submit` | Submits and validates an individual exercise answer with heart loss tracking |
| `POST` | `/api/lessons/{attempt_id}/complete` | Finalizes a completed attempt, computes score & XP, updates streak, unlocks skills |
| `POST` | `/api/lessons/{attempt_id}/abandon` | Forfeits an in-progress attempt |

### Gamification & Economy (Phase 5)
| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/gamification/hearts/status` | Current heart balance & authoritative countdown to next regenerated heart |
| `POST` | `/api/gamification/shop/refill-hearts` | Spends 50 Sparks to refill hearts to 5/5 |
| `POST` | `/api/gamification/shop/buy-streak-freeze` | Spends 100 Sparks to equip a Streak Freeze shield (max 2 capacity) |
| `GET` | `/api/gamification/leaderboard` | Active weekly Silver Loop League standings |
| `GET` | `/api/gamification/achievements` | Milestone achievements catalog with unlock and progress status |

### Development Reset (Development-Only)
| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/dev/reset-progress` | Resets learner-generated state back to the exact seeded baseline |

---

## Development Progress Reset

During development and testing, LingoLoop provides a development-only reset mechanism to restore the learner's state back to the exact pristine seeded baseline without touching curriculum content or database schema.

### Reset Invariants:
- **State Reset to Seeded Baseline**:
  - `LearnerStats`: Total XP (120), Hearts (4/5), Sparks (80), Current Streak (3), Longest Streak (5), Streak Freezes (0).
  - `UserSkillProgress`: First Words (Completed 2/2), Meet & Greet (In Progress 1/2), Tiny Conversations (Unlocked 0/2), all other 6 skills locked.
  - `LessonAttempt` & `ExerciseAttempt`: Cleared down to the 3 initial seeded attempts.
  - `DailyActivity`: Restored to the 3 initial seeded streak days (55 XP today, 40 XP yesterday, 25 XP 2 days ago).
  - `UserAchievement`: Restored to initial 2 unlocked achievements (`first_loop`, `momentum_100`).
- **Preserved Static Data**:
  - Course, Units, Skills, Lessons, Exercises, Achievement catalog definitions, learner identity (**Ankush**), seeded cohort learners, and database schema.

### How to Trigger:

1. **Via CLI Command**:
   ```bash
   python -m app.dev.reset
   ```

2. **Via REST API**:
   ```bash
   curl -X POST http://localhost:8000/api/dev/reset-progress
   ```

> **Security Guard**: Development reset is strictly guarded by `ENABLE_DEV_RESET=true` and `ENVIRONMENT=development` in `backend/app/config.py`. If disabled, requests return `403 Forbidden`.

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
