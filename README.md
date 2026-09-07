# Sudoku Master & Daily Challenge

<div align="center">

[![React](https://img.shields.io/badge/React-18.x-61DAFB?logo=react&logoColor=black)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-6.x-646CFF?logo=vite&logoColor=white)](https://vitejs.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.x-38B2AC?logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![Fastify](https://img.shields.io/badge/Fastify-5.x-000000?logo=fastify&logoColor=white)](https://fastify.dev/)
[![Prisma](https://img.shields.io/badge/Prisma-6.x-2D3748?logo=prisma&logoColor=white)](https://www.prisma.io/)
[![Neon Database](https://img.shields.io/badge/Neon-PostgreSQL-00E599?logo=postgresql&logoColor=black)](https://neon.tech/)

**[🇩🇪 Deutsch](#-deutsch) &nbsp;•&nbsp; [🇬🇧 English](#-english)**

</div>

---

## 🇩🇪 Deutsch

Eine moderne Full-Stack-Sudoku-Webanwendung mit Echtzeit-Konfliktvalidierung, animiertem Backtracking-Solver, intelligentem Hinweis-System, verschiedenen Schwierigkeitsstufen und täglichen Herausforderungen mit Streak-Tracking über Spieler-Nicknames.

### ✨ Funktionen

- **Interaktives 9×9-Raster**: Elegantes dunkles Glassmorphism-Design mit 3×3-Quadranten-Trennung, Fadenkreuz-Fokus (Zeile, Spalte, 3×3-Block) und Hervorhebung gleicher Zahlen.
- **Echtzeit-Konfliktprüfung**: Sofortige Erkennung doppelter Zahlen in Zeile, Spalte oder 3×3-Block mit rotem Glüheffekt und horizontaler Rüttelanimation.
- **Backtracking-Solver & Schritt-für-Schritt-Visualisierung**: Animierte Ausführung des rekursiven Backtracking-Algorithmus mit anpassbarer Geschwindigkeit (1x, 3x, Sofort), Pause/Fortsetzen und Schrittzähler.
- **Intelligente Hinweis-Engine**: Berechnet Kandidaten und deckt den logisch optimalen Zellenwert mit einem dezenten bernsteinfarbenen Pulsieren auf.
- **Tägliche Herausforderung (Daily Challenge)**: Deterministisches, datumsbasiertes Rätsel, das weltweit für jeden Spieler an diesem Tag identisch ist.
- **Streak-Tracking ohne Registrierung**: Zählt aufeinanderfolgende Tage, gespeichert in Neon PostgreSQL über den Nickname des Spielers (kein Login erforderlich).
- **Schwierigkeitsstufen**: Leicht (Easy), Mittel (Medium) und Schwer (Hard) aus der PostgreSQL-Datenbank.
- **Spielmetriken**: Live-Stoppuhr (`MM:SS`), Züge-Zähler und feierliches Sieges-Modal bei erfolgreicher Lösung.
- **Strenge Performance-Optimierung**: Alle Mikrointeraktionen und Animationen nutzen ausschließlich GPU-beschleunigte CSS-Eigenschaften (`transform`, `opacity`) ohne Layout-Verschiebungen.

### 🛠️ Technologie-Stack

- **Frontend**: React 18, TypeScript, Vite, Tailwind CSS, Framer Motion, Lucide Icons.
- **Backend**: Fastify, TypeScript, Prisma ORM, CORS.
- **Datenbank**: Neon Serverless PostgreSQL (Verbindungspooling + Direktverbindung).

### 📁 Projektstruktur

```
sudoku-app/
├── client/                     # Vite + React Frontend
│   ├── src/
│   │   ├── components/         # SudokuGrid, SudokuCell, NumberPad, GameControls,
│   │   │                       # DifficultySelector, DailyStreakCard, SolveBar, VictoryModal
│   │   ├── utils/              # sudoku.ts, api.ts
│   │   ├── types.ts            # TypeScript-Schnittstellen
│   │   ├── App.tsx             # Hauptkomponente
│   │   ├── index.css           # Tailwind + Glassmorphism-Stile
│   │   └── main.tsx            # App-Einstiegspunkt
│   ├── vercel.json             # Vercel SPA-Routing-Regeln
│   └── vite.config.ts          # Vite-Konfiguration & Dev-Proxy
│
├── server/                     # Fastify Backend
│   ├── prisma/
│   │   ├── schema.prisma       # Datenbankschema (puzzles, daily_challenge, streaks)
│   │   └── seed.ts             # Initialisierungsskript für Rätsel-Pool
│   ├── src/
│   │   ├── db.ts               # PrismaClient Singleton
│   │   ├── solver.ts           # Backtracking-Algorithmus & Hinweis-Logik
│   │   └── index.ts            # Fastify Server & REST-API-Endpunkte
│   ├── .env                    # Verbindungsdaten & Port (in .gitignore)
│   └── tsconfig.json
│
└── README.md
```

### 💻 Lokale Entwicklung

#### 1. Voraussetzungen
- Node.js (Version 18 oder höher)
- Kostenloses Benutzerkonto bei [Neon](https://neon.tech)

#### 2. Datenbankverbindung konfigurieren
Erstelle oder bearbeite die Datei `server/.env`:
```env
PORT=3001
HOST=localhost

# Gepoolter Verbindungsstring (mit -pooler im Host)
DATABASE_URL="postgresql://neondb_owner:dein_passwort@ep-xyz-pooler.us-east-2.aws.neon.tech/neondb?sslmode=require"

# Direkter Verbindungsstring (ohne -pooler, für Prisma-Migrationen erforderlich)
DIRECT_URL="postgresql://neondb_owner:dein_passwort@ep-xyz.us-east-2.aws.neon.tech/neondb?sslmode=require"
```

#### 3. Migrationen ausführen & Datenbank befüllen
```bash
cd server
npm install
npx prisma migrate dev --name init
npm run prisma:seed
```

#### 4. Server starten
Öffne zwei separate Terminals:

**Terminal 1 (Fastify Backend API):**
```bash
cd server
npm run dev
```
*Läuft unter http://localhost:3001*

**Terminal 2 (React Frontend App):**
```bash
cd client
npm install
npm run dev
```
*Läuft unter http://localhost:5173 mit automatischem Proxy auf Port 3001*

### 🌐 Deployment-Anleitung

#### Backend auf Render (Web Service)
1. Auf Render einen **New Web Service** erstellen und dieses GitHub-Repository verknüpfen.
2. In den Einstellungen festlegen:
   - **Root Directory**: `server`
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `npm start`
3. Unter **Environment Variables** hinzufügen:
   - `DATABASE_URL` = *(Dein gepoolter Neon-Verbindungsstring)*
   - `DIRECT_URL` = *(Dein direkter Neon-Verbindungsstring)*
   - `PORT` = `3001`
   - `HOST` = `0.0.0.0`
4. Den Dienst bereitstellen.

#### Frontend auf Vercel
1. Auf Vercel **Add New > Project** wählen und dieses Repository importieren.
2. Bei **Configure Project** einstellen:
   - **Framework Preset**: `Vite`
   - **Root Directory**: `client`
3. Unter **Environment Variables** hinzufügen:
   - `VITE_API_URL` = `https://dein-render-service.onrender.com` *(Render-Backend-URL ohne Schrägstrich am Ende)*
4. Auf **Deploy** klicken.

### 🔌 REST-API-Dokumentation

| Methode | Endpunkt | Beschreibung |
|---|---|---|
| `GET` | `/` | API-Status und Liste aller verfügbaren Endpunkte |
| `GET` | `/api/health` | Statusprüfung des Dienstes und Betriebszeit |
| `GET` | `/api/puzzles/random?difficulty=EASY\|MEDIUM\|HARD` | Ruft ein zufälliges Rätsel aus der Neon-Datenbank ab |
| `GET` | `/api/daily` | Ruft die weltweite tägliche Herausforderung ab |
| `GET` | `/api/streak?nickname={name}` | Ruft den aktuellen Streak und Spielstatus eines Spielers ab |
| `POST` | `/api/streak/complete` | Aktualisiert den Streak nach erfolgreichem Abschluss |
| `POST` | `/api/solve` | Löst das Rätsel via Backtracking; liefert Lösung & Animationsschritte |
| `POST` | `/api/hint` | Berechnet und liefert den korrekten Wert für das Zielfeld |

---

## 🇬🇧 English

A modern, full-stack Sudoku web application featuring real-time conflict validation, animated backtracking solver, intelligent hints, difficulty pools, and date-seeded daily challenges with nickname streak tracking.

### ✨ Features

- **Interactive 9×9 Grid**: Sleek dark glassmorphism board with 3×3 quadrant separation, row/column/box crosshair focus, and matching number highlights.
- **Real-Time Conflict Validation**: Instantaneous detection of row, column, and 3×3 box duplicates with crimson glow and horizontal shake animations.
- **Backtracking Solver & Step-by-Step Playback**: Animated exploration of the recursive backtracking algorithm with speed toggles (1x, 3x, Instant), pause/resume, and step counter.
- **Intelligent Hint Engine**: Analyzes candidates to reveal the optimal cell value with a subtle glowing amber pulse.
- **Date-Seeded Daily Challenge**: Deterministic calendar-based puzzle identical for all global players each day.
- **No-Auth Streak Tracking**: Consecutive day streak counter saved to Neon PostgreSQL via player nickname without requiring authentication.
- **Difficulty Pools**: Pre-generated Easy, Medium, and Hard puzzles populated in Neon PostgreSQL.
- **Game Metrics**: Live timer (`MM:SS`), move counter, and celebratory victory modal upon valid puzzle completion.
- **Strict Performance Constraint**: 100% of micro-interactions and transitions utilize GPU-accelerated `transform` and `opacity` properties with zero layout thrashing.

### 🛠️ Tech Stack

- **Frontend**: React 18, TypeScript, Vite, Tailwind CSS, Framer Motion, Lucide Icons.
- **Backend**: Fastify, TypeScript, Prisma ORM, CORS.
- **Database**: Neon Serverless PostgreSQL (pooled + direct connection).

### 📁 Project Structure

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
│   ├── .env                    # Database connection strings & port (git-ignored)
│   └── tsconfig.json
│
└── README.md
```

### 💻 Local Development Setup

#### 1. Prerequisites
- Node.js (v18 or higher)
- Free account on [Neon](https://neon.tech)

#### 2. Configure Database Credentials
Create or edit `server/.env`:
```env
PORT=3001
HOST=localhost

# Pooled connection string (with -pooler in host)
DATABASE_URL="postgresql://neondb_owner:your_password@ep-xyz-pooler.us-east-2.aws.neon.tech/neondb?sslmode=require"

# Direct connection string (without -pooler, required for Prisma migrations)
DIRECT_URL="postgresql://neondb_owner:your_password@ep-xyz.us-east-2.aws.neon.tech/neondb?sslmode=require"
```

#### 3. Run Migrations & Seed Database
```bash
cd server
npm install
npx prisma migrate dev --name init
npm run prisma:seed
```

#### 4. Run the Servers
Open two terminals:

**Terminal 1 (Backend Fastify API):**
```bash
cd server
npm run dev
```
*Server runs at http://localhost:3001*

**Terminal 2 (Frontend React App):**
```bash
cd client
npm install
npm run dev
```
*Client runs at http://localhost:5173 with auto-proxy to port 3001*

### 🌐 Deployment Guide

#### Backend on Render (Web Service)
1. In Render, create a **New Web Service** and connect this repository.
2. In Settings:
   - **Root Directory**: `server`
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `npm start`
3. Under **Environment Variables**, add:
   - `DATABASE_URL` = *(Your Neon pooled connection string)*
   - `DIRECT_URL` = *(Your Neon direct connection string)*
   - `PORT` = `3001`
   - `HOST` = `0.0.0.0`
4. Deploy the service.

#### Frontend on Vercel
1. In Vercel, click **Add New > Project** and import this repository.
2. Under **Configure Project**:
   - **Framework Preset**: `Vite`
   - **Root Directory**: `client`
3. Under **Environment Variables**, add:
   - `VITE_API_URL` = `https://your-render-service.onrender.com` *(Your Render backend URL without trailing slash)*
4. Click **Deploy**.

### 🔌 REST API Documentation

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/` | API status and available route endpoints |
| `GET` | `/api/health` | Service health status and uptime check |
| `GET` | `/api/puzzles/random?difficulty=EASY\|MEDIUM\|HARD` | Fetches a random puzzle from Neon DB |
| `GET` | `/api/daily` | Fetches the date-seeded global daily challenge |
| `GET` | `/api/streak?nickname={name}` | Retrieves current streak and play status for a user |
| `POST` | `/api/streak/complete` | Updates consecutive daily streak upon challenge completion |
| `POST` | `/api/solve` | Executes backtracking solver; returns solution and playback steps |
| `POST` | `/api/hint` | Calculates and returns the correct value for target/optimal cell |

---

## 📄 Lizenz / License
MIT License © 2026