# Sudoku Master & Daily Challenge

A modern, full-stack Sudoku web application featuring real-time conflict validation, animated backtracking solver, intelligent hints, difficulty pools, and date-seeded daily challenges with nickname streak tracking.

---

## Features

- **Interactive 9×9 Grid**: Sleek dark glassmorphism board with 3×3 quadrant separation, row/column/box crosshair focus, and matching number highlights.
- **Real-Time Conflict Validation**: Instantaneous detection of row, column, and 3×3 box duplicates with crimson glow and horizontal shake animations.
- **Backtracking Solver & Step-by-Step Playback**: Animated exploration of the recursive backtracking algorithm with speed toggles (1x, 3x, Instant), pause/resume, and step counter.
- **Intelligent Hint Engine**: Analyzes candidates to reveal the optimal cell value with a subtle glowing amber pulse.
- **Date-Seeded Daily Challenge**: Deterministic calendar-based puzzle identical for all global players each day.
- **No-Auth Streak Tracking**: Consecutive day streak counter saved to Neon PostgreSQL via player nickname without requiring authentication.
- **Difficulty Pools**: Pre-generated Easy, Medium, and Hard puzzles populated in Neon PostgreSQL.
- **Game Metrics**: Live timer (`MM:SS`), move counter, and celebratory victory modal upon valid puzzle completion.
- **Strict Performance Constraint**: 100% of micro-interactions and transitions utilize GPU-accelerated `transform` and `opacity` properties with zero layout thrashing.

---

## Tech Stack

- **Frontend**: React 18, TypeScript, Vite, Tailwind CSS, Framer Motion, Lucide Icons.
- **Backend**: Fastify, TypeScript, Prisma ORM, CORS.
- **Database**: Neon Serverless PostgreSQL (pooled + direct connection).

---

## Project Structure

```
sudoku-app/
├── client/                     # Vite + React Frontend
│   ├── src/
│   │   ├── components/         # SudokuGrid, SudokuCell, NumberPad, GameControls,
│   │   │                       # DifficultySelector, DailyStreakCard, SolveBar, VictoryModal
│   │   ├── utils/              # sudoku.ts, api.ts
│   │   ├── types.ts            # TypeScript interfaces
│   │   ├── App.tsx             # Main application component
│   │   ├── index.css           # Tailwind + glassmorphism tokens
│   │   └── main.tsx            # Entrypoint
│   ├── vercel.json             # Vercel SPA routing rules
│   └── vite.config.ts          # Vite configuration & dev proxy
│
├── server/                     # Fastify Backend
│   ├── prisma/
│   │   ├── schema.prisma       # Database schema (puzzles, daily_challenge, streaks)
│   │   └── seed.ts             # Database seed script for puzzle pool
│   ├── src/
│   │   ├── db.ts               # PrismaClient singleton
│   │   ├── solver.ts           # Recursive backtracking algorithm & hint logic
│   │   └── index.ts            # Fastify server & REST API endpoints
│   ├── .env                    # Database connection strings & port
│   └── tsconfig.json
│
└── README.md
```

---

## Local Development Setup

### 1. Prerequisites
- Node.js (v18 or higher)
- Free account on [Neon](https://neon.tech)

### 2. Configure Database Credentials
Create or edit `server/.env`:
```env
PORT=3001
HOST=localhost

# Pooled connection string (with -pooler in host)
DATABASE_URL="postgresql://neondb_owner:your_password@ep-xyz-pooler.us-east-2.aws.neon.tech/neondb?sslmode=require"

# Direct connection string (without -pooler, required for Prisma migrations)
DIRECT_URL="postgresql://neondb_owner:your_password@ep-xyz.us-east-2.aws.neon.tech/neondb?sslmode=require"
```

### 3. Run Migrations & Seed Database
```powershell
cd server
npm install
npx prisma migrate dev --name init
npm run prisma:seed
```

### 4. Run the Servers
Open two terminals:

**Terminal 1 (Backend Fastify API):**
```powershell
cd server
npm run dev
```
*Server runs at http://localhost:3001*

**Terminal 2 (Frontend React App):**
```powershell
cd client
npm install
npm run dev
```
*Client runs at http://localhost:5173 with auto-proxy to port 3001*

---

## Deployment Guide

### Deploying the Backend on Render

1. Go to **[render.com](https://render.com)** and create a **New Web Service**.
2. Connect your GitHub repository.
3. Configure the service settings:
   - **Name**: `sudoku-api`
   - **Root Directory**: `server`
   - **Environment**: `Node`
   - **Build Command**: `npm install && npx prisma generate && npm run build`
   - **Start Command**: `node dist/index.js`
4. In **Environment Variables**, add:
   - `PORT` = `10000` (Render default port)
   - `HOST` = `0.0.0.0`
   - `DATABASE_URL` = *(Your Neon pooled connection string)*
   - `DIRECT_URL` = *(Your Neon direct connection string)*
5. Set the **Health Check Path** to `/api/health`.
6. Click **Create Web Service**. Once deployed, copy your backend URL (e.g., `https://sudoku-api.onrender.com`).

---

### Deploying the Frontend on Vercel

1. Go to **[vercel.com](https://vercel.com)** and click **Add New > Project**.
2. Import your GitHub repository.
3. In **Project Settings**:
   - **Root Directory**: Click **Edit** and choose `client`.
   - **Framework Preset**: `Vite`.
   - **Build Command**: `npm run build`.
   - **Output Directory**: `dist`.
4. In **Environment Variables**, add:
   - `VITE_API_URL` = `https://sudoku-api.onrender.com` *(Paste your Render backend URL with no trailing slash)*.
5. Click **Deploy**. Vercel will build and host your frontend globally with SSL enabled.
6. The included `client/vercel.json` ensures client-side routing works smoothly.

---

## REST API Documentation

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/health` | Service health status and uptime verification |
| `GET` | `/api/puzzles/random?difficulty=EASY\|MEDIUM\|HARD` | Fetches a random puzzle from Neon DB |
| `GET` | `/api/daily` | Fetches the date-seeded global daily challenge |
| `GET` | `/api/streak?nickname={name}` | Retrieves current streak and play status for a user |
| `POST` | `/api/streak/complete` | Updates consecutive daily streak upon challenge completion |
| `POST` | `/api/solve` | Executes backtracking solver; returns solution and playback steps |
| `POST` | `/api/hint` | Calculates and returns the correct value for target/optimal cell |

---

## License
MIT License