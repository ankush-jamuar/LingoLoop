# LingoLoop — Phase 1: Project Foundation

LingoLoop is an original full-stack language-learning web application built with Next.js (App Router, TypeScript, Tailwind CSS, Framer Motion, Lucide) and FastAPI (Python, SQLAlchemy, SQLite, Pydantic).

LingoLoop introduces a cyclical cognitive cadence:

$$\text{Learn} \longrightarrow \text{Practice} \longrightarrow \text{Recall} \longrightarrow \text{Earn} \longrightarrow \text{Repeat}$$

---

## Phase 1 Implementation Status

Phase 1 establishes the full-stack foundation, design system tokens, mascot design direction, and integration health monitoring:

- [x] **Monorepo Architecture**: Clean separation between `frontend/` and `backend/` with unified `.gitignore` and `.env.example`.
- [x] **Product Identity & Design System**: Custom palette tokens (`INK`, `CREAM`, `CORAL`, `VIOLET`, `SUN`, `AQUA`, `MINT`) configured idiomatically in Tailwind CSS.
- [x] **Typography Hierarchy**: Google Fonts `Plus Jakarta Sans` (display headings) and `Nunito Sans` (interface body) with resilient system fallbacks.
- [x] **Branding Assets**:
  - `Logo.tsx`: Original vector ribbon/loop mark and brand wordmark.
  - `MiloMascot.tsx`: Original speech-bubble companion character concept.
- [x] **Welcome & Learning Loop Preview**: Tactile 5-step interactive loop showcase (`Learn` → `Practice` → `Recall` → `Earn` → `Repeat`).
- [x] **Backend Infrastructure**: FastAPI application with CORS origin parsing, SQLite connection, SQLAlchemy 2.0 declarative `Base`, and session management (`get_db`).
- [x] **Health Check & Frontend Integration**: `GET /api/health` endpoint returning `{"status": "ok", "service": "lingoloop-api"}` with lightweight live connection pill in the frontend.

> **Scope Note**: In accordance with Phase 1 constraints, course curriculum, domain schemas, lesson player, XP/hearts/streaks gamification, profile, and user authentication are deferred to subsequent phases.

---

## Repository Structure

```text
lingoloop/
│
├── frontend/                     # Next.js App Router frontend
│   ├── app/
│   │   ├── layout.tsx            # Root layout with fonts & metadata
│   │   ├── page.tsx              # Phase 1 welcome & loop preview
│   │   └── globals.css           # Semantic tokens & tactile surface utilities
│   ├── components/
│   │   ├── branding/
│   │   │   ├── Logo.tsx          # Original vector/text wordmark
│   │   │   └── MiloMascot.tsx    # Milo speech-bubble mascot preview
│   │   ├── layout/
│   │   │   ├── Navbar.tsx        # Header with brand & live API status pill
│   │   │   └── Footer.tsx        # Editorial footer
│   │   ├── preview/
│   │   │   └── LearningLoop.tsx  # 5-step visual loop preview
│   │   └── ui/
│   │       ├── Button.tsx        # Tactile buttons with micro-interactions
│   │       └── Badge.tsx         # Semantic brand token badges
│   ├── lib/
│   │   ├── api/
│   │   │   ├── client.ts         # Base fetch client with error handling
│   │   │   └── health.ts         # GET /api/health caller
│   │   └── utils.ts              # Classname merging utility
│   ├── tsconfig.json
│   └── package.json
│
├── backend/                      # FastAPI backend service
│   ├── app/
│   │   ├── main.py               # FastAPI entry point, lifespan, CORS
│   │   ├── config.py             # Settings management with pydantic-settings
│   │   ├── database.py           # SQLite engine, sessionmaker, and Base
│   │   ├── models/               # SQLAlchemy declarative Base (Phase 1)
│   │   ├── schemas/              # Pydantic schemas (HealthResponse)
│   │   ├── routes/               # API routes (/api/health)
│   │   └── services/             # Business logic layer foundation
│   ├── seed/                     # Future seed data placeholder
│   ├── requirements.txt
│   └── README.md
│
├── .gitignore
├── .env.example
└── README.md
```

---

## Design System Tokens

| Token | Hex Value | Semantic Usage |
|---|---|---|
| **INK** | `#18202A` | Primary typography, deep accents, tactile borders |
| **CREAM** | `#FFF9EF` | Canvas background, warm rounded surfaces |
| **CORAL** | `#FF6B5F` | Primary brand accent, interactive action CTAs |
| **VIOLET** | `#7567F8` | Learning loop accent, depth, focus highlights |
| **SUN** | `#FFC857` | Achievement highlights, warm accents |
| **AQUA** | `#35C7B4` | Practice & reinforcement accent |
| **MINT** | `#DDF5E9` | Soft badge backgrounds, success highlights |

---

## Getting Started

### Prerequisites
- Node.js (v18+) & npm
- Python (3.11+) & pip

---

### Backend Setup

1. Navigate to the `backend/` directory:
   ```bash
   cd backend
   ```

2. Install Python dependencies:
   ```bash
   pip install -r requirements.txt
   ```

3. Start the FastAPI development server:
   ```bash
   uvicorn app.main:app --reload --port 8000
   ```

4. Verify the health check:
   - Endpoint: `http://localhost:8000/api/health`
   - Response: `{"status": "ok", "service": "lingoloop-api"}`
   - Interactive Swagger Docs: `http://localhost:8000/docs`

---

### Frontend Setup

1. Navigate to the `frontend/` directory:
   ```bash
   cd frontend
   ```

2. Install Node dependencies:
   ```bash
   npm install
   ```

3. Start the Next.js development server:
   ```bash
   npm run dev
   ```

4. Open `http://localhost:3000` in your browser. The navbar will automatically verify connectivity to the backend and display **API Connected**.

---

## Environment Variables

Copy `.env.example` to `.env` or configure separately:

```env
# Frontend
NEXT_PUBLIC_API_URL=http://localhost:8000

# Backend
DATABASE_URL=sqlite:///./lingoloop.db
CORS_ORIGINS=http://localhost:3000,http://127.0.0.1:3000
```

---

## Roadmap

- **Phase 2**: Domain Schema, Seeded Course Curriculum, & Database Migrations.
- **Phase 3**: Core Lesson Player, Interactive Exercises, & Audio Integration.
- **Phase 4**: Gamification Engine (XP, Hearts, Streaks, Daily Goals, & Leaderboards).
- **Phase 5**: User Authentication, Profile, & Compounding Mastery Metrics.
