# LingoLoop

**LingoLoop** is a full-stack, Duolingo-inspired language-learning web application designed around a structured cognitive learning loop:

$$\text{Learn} \longrightarrow \text{Practice} \longrightarrow \text{Recall} \longrightarrow \text{Earn} \longrightarrow \text{Repeat}$$

The platform combines a tactile visual learning path, a 5-format interactive lesson engine, server-authoritative progression, heart stamina mechanics, a Sparks economy with shop refills, weekly league leaderboards, milestone achievements, a learner profile, and an animated mascot companion named **Milo**.

---

## Features

- **Tactile Learning Path & Loop Map**: Visual learning tree organized into thematic units containing 9 Loop Islands (skills) connected via a continuous ribbon track with locked, unlocked, in-progress, completed, and crown mastery states.
- **Interactive Multi-Format Lesson Engine**: Server-authoritative lesson player supporting 5 distinct exercise formats:
  1. *Multiple Choice*
  2. *Translate / Interactive Word Bank Tile Builder*
  3. *Match Pairs (Tactile Bidirectional Pairing)*
  4. *Fill in the Blank*
  5. *Type Answer (with forgiving unicode/case normalization)*
- **Real-Time Stamina & Hearts Engine**: 5-heart stamina pool that tracks mistake loss, time-based passive regeneration (1 heart / 4 hours), free practice heart recovery, and instant shop refills.
- **Sparks Economy & Shop**: In-game currency earned from completing loops and unlocking milestones. Spend Sparks on instant Heart Refills (50 Sparks) and Streak Freeze shields (100 Sparks).
- **Streak & Daily Goal Tracking**: Daily streak counter with streak freeze protection and configurable daily XP goals (30 XP baseline).
- **Momentum League (Leaderboard)**: Weekly Silver Loop League tier featuring top-3 podium celebrations, ranks 1–4 promotion zones, and cohort competition against 9 simulated peers based on real weekly `DailyActivity` XP.
- **Milestone Achievements Catalog**: Permanent badges with progression bars and automatic evaluation upon lesson completion.
- **Learner Profile (`/profile`)**: Lifetime statistics overview (Total XP, Streak, Mastered Skills, Lessons Completed, Crowns), Daily Goal progress bar, and earned achievements showcase.
- **Settings Placeholders (`/settings`)**: Configurable daily XP pace, audio and animation preferences, streak reminders, and architecture details.
- **Milo Mascot Companion**: Original character with 4 animated moods (*cheerful*, *curious*, *celebrating*, *encouraging*) accompanying the evaluator across the landing page, dynamic active learning nodes on the Loop Map, lesson feedback panels, and celebration screens.
- **Development & Evaluator Reset**: Genuinely fresh learner reset via CLI, REST API, or footer button returning the application to an unstarted baseline (0 XP, 5/5 hearts, 0 streak, 0 sparks, First Words 0/2).

---

## Tech Stack

### Frontend
- **Framework**: Next.js 16 (App Router)
- **Language**: TypeScript 5
- **Styling**: Tailwind CSS v4 (Design tokens & CSS variables)
- **Animations**: Framer Motion
- **Icons**: Lucide React

### Backend
- **Framework**: FastAPI (Python 3.11+)
- **ORM**: SQLAlchemy 2.0
- **Database**: SQLite
- **Validation**: Pydantic v2
- **Server**: Uvicorn

---

## Architecture

```text
┌─────────────────────────────────────────────────────────────┐
│                    Browser Client (Next.js)                 │
│  Landing (/) • Map (/learn) • Lesson Player (/lesson/[id])  │
│  League (/leaderboard) • Badges (/achievements) • (/profile)│
└──────────────────────────────┬──────────────────────────────┘
                               │ JSON REST API (HTTP)
┌──────────────────────────────▼──────────────────────────────┐
│                    FastAPI Backend Router                   │
│  /courses • /learners • /lessons • /gamification • /dev     │
└──────────────────────────────┬──────────────────────────────┘
                               │ SQLAlchemy 2.0 ORM
┌──────────────────────────────▼──────────────────────────────┐
│                    SQLite Database Engine                   │
│  13 Tables: Course Hierarchy • Learner Progress • Gamified  │
└─────────────────────────────────────────────────────────────┘
```

### Directory Structure

```text
LingoLoop/
├── frontend/
│   ├── app/                    # Next.js App Router pages
│   │   ├── page.tsx            # Public Landing Page (/)
│   │   ├── learn/              # Loop Map Learning Path (/learn)
│   │   ├── lesson/[lessonId]/  # Interactive Lesson Player (/lesson/[id])
│   │   ├── leaderboard/        # Momentum League (/leaderboard)
│   │   ├── achievements/       # Milestone Badges (/achievements)
│   │   ├── profile/            # Learner Profile (/profile)
│   │   ├── settings/           # Preferences & Placeholders (/settings)
│   │   └── layout.tsx          # Root Layout & Metadata
│   ├── components/             # Reusable UI & Feature Components
│   │   ├── branding/           # Logo & MiloMascot
│   │   ├── gamification/       # SparksShopModal & Tier badges
│   │   ├── layout/             # Navbar & Footer with Dev Reset
│   │   ├── learning-path/      # LoopMap, UnitSection, SkillNode, RibbonPath
│   │   ├── lesson/             # Header, Feedback, Complete/Failed Screens

│   │   └── ui/                 # Button, Badge, Modal, StatsPill
│   └── lib/api/                # Strongly-typed API client fetchers
└── backend/
    ├── app/
    │   ├── main.py             # FastAPI App entrypoint & CORS config
    │   ├── config.py           # Pydantic Settings & environment flags
    │   ├── database.py         # SQLAlchemy engine & session factory
    │   ├── models/             # 13 SQLAlchemy domain models
    │   ├── schemas/            # Pydantic request/response schemas
    │   ├── routes/             # Modular API endpoints
    │   ├── services/           # Authoritative business logic
    │   └── dev/                # CLI reset tools
    ├── seed/                   # Idempotent curriculum & cohort seeders
    └── tests/                  # Automated test suites
```

---

## Routes

| Route | View | Description |
|---|---|---|
| `/` | **Public Landing Page** | Evaluator welcome screen with animated Milo, value proposition, and distinct **Start Learning** & **Explore Loop Map** CTAs. |
| `/learn` | **Loop Map** | Interactive curriculum path with 3 Units, 9 Loop Islands, Continue Learning banner, and active-node Milo companion. |
| `/lesson/[lessonId]` | **Lesson Player** | Interactive 5-exercise lesson engine with heart stamina, live checking, and celebratory complete screens. |
| `/leaderboard` | **Momentum League** | Silver Loop League weekly leaderboard, Top 3 podium, and promotion/demotion cutoffs. |
| `/achievements` | **Milestones** | 6 milestone achievement badges with progress bars and Sparks awards. |
| `/profile` | **Learner Profile** | Lifetime stats (XP, Streak, Crowns, Mastered Loops), daily goal progress, and unlocked badges. |
| `/settings` | **Settings** | Daily XP goal target selector, audio/animation toggles, and platform metadata. |

---

## API Overview

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/health` | Service health status check. |
| `GET` | `/api/courses/active` | Active language course metadata. |
| `GET` | `/api/courses/{course_id}/map` | Full unit, skill, and lesson hierarchy with learner progression states. |
| `GET` | `/api/skills/{skill_id}` | Detailed metadata and lesson summaries for a skill. |
| `GET` | `/api/learners/current` | Active learner identity and lifetime stats. |
| `GET` | `/api/learners/current/next-lesson` | Recommended next actionable lesson for progression front. |
| `POST` | `/api/lessons/{lesson_id}/start` | Initiates or resumes a `LessonAttempt` session. |
| `POST` | `/api/lessons/{attempt_id}/submit` | Validates an exercise answer and computes heart loss/XP. |
| `POST` | `/api/lessons/{attempt_id}/complete` | Finalizes a completed lesson, awards XP, updates streak and unlocks next skills. |
| `POST` | `/api/lessons/{attempt_id}/abandon` | Abandons an in-progress lesson session upon exit. |
| `GET` | `/api/gamification/hearts/status` | Current heart balance, countdown to next regenerated heart, and shop pricing. |
| `POST` | `/api/gamification/shop/refill-hearts` | Spends 50 Sparks for an instant refill to 5/5 hearts. |
| `POST` | `/api/gamification/shop/buy-streak-freeze` | Spends 100 Sparks to purchase a streak freeze shield. |
| `GET` | `/api/gamification/leaderboard` | Active weekly league standings and rank tiers. |
| `GET` | `/api/gamification/achievements` | Milestone achievements with progress and unlock status. |
| `POST` | `/api/dev/reset-progress` | Development-only endpoint resetting learner to fresh unstarted baseline. |

---

## Database Schema

```text
Course (1) ───< Unit (3) ───< Skill (9) ───< Lesson (18) ───< Exercise (90)
                                                    │
User (Ankush + Cohort)                              │
 ├── LearnerStats (1:1)                             │
 ├── UserSkillProgress (1:N)                        │
 ├── DailyActivity (1:N)                            │
 ├── UserAchievement (1:N)                         │
 └── LessonAttempt (1:N) ───────────────────────────┘
      └── ExerciseAttempt (1:N)
```

### Models Summary

- **`Course`**: Root curriculum container (`source_language`, `target_language`).
- **`Unit`**: Thematic learning section (`title`, `description`, `order_index`).
- **`Skill`**: Loop Island skill node (`icon_key`, `xp_reward`, `is_locked_by_default`).
- **`Lesson`**: Discrete lesson inside a skill (`xp_reward`, `order_index`).
- **`Exercise`**: Interactive question (`type`, `prompt`, `instruction`, JSON `content`).
- **`User`**: Learner identity (`name`, `email`, `avatar_key`).
- **`LearnerStats`**: Aggregate stats (`total_xp`, `current_streak`, `longest_streak`, `hearts`, `max_hearts`, `gems`, `streak_freeze_count`, `daily_goal_xp`, `hearts_updated_at`).
- **`UserSkillProgress`**: Per-skill progress (`status`, `is_unlocked`, `completed`, `crown_level`, `lessons_completed`, `xp_earned`).
- **`DailyActivity`**: Per-day calendar activity record (`activity_date`, `xp_earned`, `lessons_completed`, `minutes_practiced`).
- **`Achievement` & `UserAchievement`**: Milestone definitions and learner unlock timestamps.
- **`LessonAttempt` & `ExerciseAttempt`**: Granular session history and submission audit trails.

---

## Seed Data

The idempotent database seed (`python -m seed.seed`) populates:
- **1 Course**: Spanish for English Speakers
- **3 Units**: Unit 1 (First Connections), Unit 2 (Daily Rhythm), Unit 3 (World & Wonder)
- **9 Skills**: First Words, Meet & Greet, Tiny Conversations, Numbers & Time, Food & Cafe, Home & Objects, City & Transit, Nature & Days, People & Feelings
- **18 Lessons**: 2 lessons per skill with structured vocabulary and dialogue progression
- **90 Exercises**: 5 exercises per lesson evenly distributed across all 5 exercise formats
- **6 Achievements**: First Loop, Momentum 100, Master 3 Skills, 3-Day Streak, 7-Day Streak, Perfect Loop
- **10 Learners**: 1 default learner (**Ankush**) + 9 simulated peers for the Momentum League

---

## Local Setup

### Prerequisites
- Node.js 18+ and npm
- Python 3.11+
- Git

### 1. Backend Setup

```bash
# Navigate to backend directory
cd backend

# Create and activate virtual environment
# On Windows (PowerShell):
python -m venv .venv
.venv\Scripts\Activate.ps1

# On macOS/Linux:
python3 -m venv .venv
source .venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Run initial database migration & seed
python -m seed.seed

# Start FastAPI development server
uvicorn app.main:app --reload --port 8000
```

- Backend API: `http://localhost:8000`
- Interactive OpenAPI Docs: `http://localhost:8000/docs`
- Health Endpoint: `http://localhost:8000/api/health`

### 2. Frontend Setup

```bash
# In a separate terminal, navigate to frontend directory
cd frontend

# Install npm dependencies
npm install

# Start Next.js development server
npm run dev
```

- Web App: `http://localhost:3000`

---

## Environment Variables

### Backend (`backend/.env`)

```env
ENVIRONMENT=development
DATABASE_URL=sqlite:///./lingoloop.db
CORS_ORIGINS=http://localhost:3000,http://127.0.0.1:3000
ENABLE_DEV_RESET=true
```

### Frontend (`frontend/.env.local`)

```env
NEXT_PUBLIC_API_URL=http://localhost:8000
```

---

## Development Reset

A development-only reset mechanism is provided to allow evaluators to return the application to a pristine, unstarted learner state without manually modifying SQLite:

- **CLI Command**:
  ```bash
  cd backend
  python -m app.dev.reset
  ```
- **REST Endpoint**:
  ```http
  POST http://localhost:8000/api/dev/reset-progress
  ```
- **UI Button**: Located in the footer on any page (**"Reset Seed Data (Dev)"**).

**Reset Action**: Clears attempts, daily activities, and user achievements; resets `LearnerStats` to 0 XP, 5/5 Hearts, 0 Sparks, and 0 Streak; sets *First Words* to unlocked (0/2 lessons) with all remaining skills locked; clears browser cache; and redirects to the landing page (`/`).

---

## Testing & Quality Audits

### Automated Backend Tests

```bash
cd backend

# 1. Test development reset baseline and security guard
python -m tests.test_dev_reset

# 2. Test gamification engine (Hearts regen, shop refills, streak defense, leaderboard)
python -m tests.test_gamification_engine

# 3. Run Phase 4 progression and XP consistency audit
python -m tests.test_audit_progression
```

### Frontend Lint & Production Build

```bash
cd frontend

# Run ESLint (0 errors, 0 warnings)
npm run lint

# Run Next.js production build (compiles all 7 routes)
npm run build
```

---

## Deployment Guide

- **Frontend Deployment (Vercel)**:
  - Framework Preset: Next.js
  - Root Directory: `frontend`
  - Build Command: `npm run build`
  - Environment Variable: `NEXT_PUBLIC_API_URL=https://<your-backend-domain>.onrender.com`
- **Backend Deployment (Render / Railway / Fly.io)**:
  - Build Command: `pip install -r requirements.txt && python -m seed.seed`
  - Start Command: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
  - Environment Variables:
    - `ENVIRONMENT=production`
    - `DATABASE_URL=sqlite:///./lingoloop.db`
    - `CORS_ORIGINS=https://<your-vercel-domain>.vercel.app`
    - `ENABLE_DEV_RESET=true` (Enabled for evaluation/demo purposes)

---

## Design System & Branding

- **Original Branding**: LingoLoop wordmark and vector loop geometry.
- **Milo Mascot**: Expressive speech-bubble character with 4 dynamic emotional moods:
  - `cheerful`: Idle floating on landing page and fresh map nodes.
  - `curious`: Inquisitive expression on settings and error retry states.
  - `celebrating`: Confetti jump on correct answers and lesson completion screens.
  - `encouraging`: Empathetic feedback on incorrect answers with clear solution guidance.
- **Color Tokens**:
  - `Coral` (`#F76F53`) — Primary brand action & active node pulses
  - `Ink` (`#18202A`) — High-contrast typography & tactile button borders
  - `Cream` (`#FFFDF9`) — Warm background surface
  - `Violet` (`#7E57C2`) — Momentum XP & unit themes
  - `Sun` (`#FFB300`) — Sparks currency & mastery crowns
  - `Mint` (`#A3E635`) — Mastered loop nodes & success states

---

## Assumptions & Disclosures

- **Authentication**: Uses a single default learner identity (**Ankush**) without login/passwords, as permitted by the assignment specification.
- **Curriculum**: Features one comprehensive, seeded Spanish course with 3 units, 9 skills, 18 lessons, and 90 exercises.
- **Economy**: Sparks and gem balances are gamified in-app currency for stamina refills and streak freezes; no real monetary transactions are involved.
- **Speech / Audio**: Speech recognition and TTS audio playback are omitted per the assignment optional scope.

---

## Evaluation Walkthrough

Follow this step-by-step flow to evaluate the complete LingoLoop platform:

1. **Landing Page (`/`)**: Open `http://localhost:3000/`. Observe the animated Milo companion and cognitive loop strip.
2. **Start Learning**: Click **"Start Learning"**. Notice how it directly routes you into **Unit 1 / First Words / Lesson 1** (`/lesson/1`) without map confusion.
3. **Lesson Experience**:
   - Answer Exercise 1 (Multiple Choice). Observe the **"LOOP CLOSED! Nice work!"** feedback with celebrating Milo.
   - Complete the remaining exercises (Word Bank Translate, Match Pairs, Fill in Blank, Type Answer).
   - Test an intentional wrong answer to observe heart stamina loss (-1 Heart) and encouraging Milo feedback.
4. **Lesson Completion**: On the **Loop Complete** screen, observe the total XP awarded, accuracy score, and streak progression.
5. **Loop Map (`/learn`)**: Click **"Continue the Loop"**. Verify that *First Words* is now at `1/2` progress, and Milo has updated its speech bubble to *"Ready for the next loop?"*.
6. **Momentum League (`/leaderboard`)**: Inspect the Silver Loop League standings, weekly XP ranks, and top-3 podium.
7. **Milestones (`/achievements`)**: View unlocked badges (e.g. *First Loop*) and check progress toward other milestones.
8. **Learner Profile (`/profile`)**: Inspect lifetime stats, daily goal progress bar (today's XP vs 30 XP target), and curriculum summary.
9. **Settings (`/settings`)**: Adjust the Daily XP goal pace and audio/animation preferences.
10. **Evaluator Reset**: Click **"Reset Seed Data (Dev)"** in the footer. Verify that the app resets atomically, clears browser storage, redirects to `/`, and clicking "Start Learning" starts Lesson 1 fresh again.
