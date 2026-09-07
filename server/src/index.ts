import Fastify from 'fastify';
import cors from '@fastify/cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { solveSudoku, getHint } from './solver.js';
import { prisma } from './db.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '../.env') });

const server = Fastify({
  logger: true
});

// Register CORS for frontend requests
await server.register(cors, {
  origin: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS']
});

function getTodayDateString(): string {
  return new Date().toISOString().split('T')[0];
}

function getYesterdayDateString(): string {
  const d = new Date();
  d.setDate(d.getDate() - 1);
  return d.toISOString().split('T')[0];
}

// Root route for API welcome & status
server.get('/', async (_request, _reply) => {
  return {
    service: 'Sudoku API',
    status: 'online',
    version: '1.0.0',
    endpoints: {
      health: '/api/health',
      daily: '/api/daily',
      random_puzzle: '/api/puzzles/random?difficulty=EASY',
      streak: '/api/streak?nickname=Player1'
    }
  };
});

// Health check endpoint
server.get('/api/health', async (_request, _reply) => {
  return {
    status: 'ok',
    timestamp: new Date().toISOString(),
    service: 'Sudoku Fastify API',
    version: '1.0.0'
  };
});

// Fetch random puzzle from Neon DB by difficulty
server.get('/api/puzzles/random', async (request, reply) => {
  const query = request.query as { difficulty?: string };
  const difficulty = (query.difficulty || 'MEDIUM').toUpperCase();

  try {
    const count = await prisma.puzzle.count({
      where: { difficulty }
    });

    if (count === 0) {
      return reply.status(404).send({
        success: false,
        error: `No puzzles found for difficulty ${difficulty}`
      });
    }

    const skip = Math.floor(Math.random() * count);
    const puzzle = await prisma.puzzle.findFirst({
      where: { difficulty },
      skip,
      select: {
        id: true,
        difficulty: true,
        puzzle_data: true,
        solution_data: true,
      }
    });

    return {
      success: true,
      puzzle
    };
  } catch (err: unknown) {
    server.log.error(err);
    return reply.status(500).send({
      success: false,
      error: 'Failed to fetch puzzle from database.'
    });
  }
});

// Daily Challenge endpoint (Date-seeded puzzle, identical for all users each day)
server.get('/api/daily', async (_request, reply) => {
  const today = getTodayDateString();

  try {
    let daily = await prisma.dailyChallenge.findUnique({
      where: { date: today },
      include: { puzzle: true }
    });

    if (!daily) {
      const puzzles = await prisma.puzzle.findMany({ orderBy: { id: 'asc' } });
      if (puzzles.length === 0) {
        return reply.status(404).send({
          success: false,
          error: 'No puzzles available in database to assign as daily challenge.'
        });
      }

      // Deterministic hash based on date string
      let hash = 0;
      for (let i = 0; i < today.length; i++) {
        hash = (hash * 31 + today.charCodeAt(i)) >>> 0;
      }
      const chosenPuzzle = puzzles[hash % puzzles.length];

      daily = await prisma.dailyChallenge.create({
        data: {
          date: today,
          puzzle_id: chosenPuzzle.id
        },
        include: { puzzle: true }
      });
    }

    return {
      success: true,
      date: today,
      puzzle: daily.puzzle
    };
  } catch (err: unknown) {
    server.log.error(err);
    return reply.status(500).send({
      success: false,
      error: 'Failed to fetch daily challenge from database.'
    });
  }
});

// Get user streak by nickname
server.get('/api/streak', async (request, reply) => {
  const query = request.query as { nickname?: string };
  const nickname = query.nickname?.trim();

  if (!nickname) {
    return reply.status(400).send({
      success: false,
      error: 'Nickname is required.'
    });
  }

  const today = getTodayDateString();
  const yesterday = getYesterdayDateString();

  try {
    let streak = await prisma.streak.findUnique({
      where: { nickname }
    });

    if (!streak) {
      streak = await prisma.streak.create({
        data: {
          nickname,
          current_streak: 0,
          last_played: null
        }
      });
    } else {
      // If last played was before yesterday, streak resets to 0
      if (streak.last_played && streak.last_played !== today && streak.last_played !== yesterday) {
        streak = await prisma.streak.update({
          where: { nickname },
          data: { current_streak: 0 }
        });
      }
    }

    return {
      success: true,
      nickname: streak.nickname,
      current_streak: streak.current_streak,
      last_played: streak.last_played,
      has_played_today: streak.last_played === today
    };
  } catch (err: unknown) {
    server.log.error(err);
    return reply.status(500).send({
      success: false,
      error: 'Failed to fetch streak from database.'
    });
  }
});

// Record completion of Daily Challenge and update streak
server.post('/api/streak/complete', async (request, reply) => {
  const body = request.body as { nickname?: string };
  const nickname = body?.nickname?.trim();

  if (!nickname) {
    return reply.status(400).send({
      success: false,
      error: 'Nickname is required.'
    });
  }

  const today = getTodayDateString();
  const yesterday = getYesterdayDateString();

  try {
    const streak = await prisma.streak.findUnique({
      where: { nickname }
    });

    let currentStreak = 1;
    if (streak) {
      if (streak.last_played === today) {
        return {
          success: true,
          nickname: streak.nickname,
          current_streak: streak.current_streak,
          already_completed_today: true
        };
      }

      if (streak.last_played === yesterday) {
        currentStreak = streak.current_streak + 1;
      } else {
        currentStreak = 1;
      }
    }

    const updated = await prisma.streak.upsert({
      where: { nickname },
      update: {
        current_streak: currentStreak,
        last_played: today
      },
      create: {
        nickname,
        current_streak: 1,
        last_played: today
      }
    });

    return {
      success: true,
      nickname: updated.nickname,
      current_streak: updated.current_streak,
      already_completed_today: false
    };
  } catch (err: unknown) {
    server.log.error(err);
    return reply.status(500).send({
      success: false,
      error: 'Failed to update streak.'
    });
  }
});

// Backtracking Solver endpoint
server.post('/api/solve', async (request, reply) => {
  const body = request.body as { board?: (number | null)[][] };

  if (!body || !Array.isArray(body.board) || body.board.length !== 9) {
    return reply.status(400).send({
      success: false,
      error: 'Invalid request body. Expected a 9x9 board array.'
    });
  }

  for (let r = 0; r < 9; r++) {
    if (!Array.isArray(body.board[r]) || body.board[r].length !== 9) {
      return reply.status(400).send({
        success: false,
        error: `Invalid row ${r}. Expected 9 cells.`
      });
    }
  }

  const result = solveSudoku(body.board);
  if (!result.success) {
    return reply.status(422).send(result);
  }

  return result;
});

// Single Cell Hint endpoint
server.post('/api/hint', async (request, reply) => {
  const body = request.body as {
    board?: (number | null)[][];
    preferredPos?: { row: number; col: number } | null;
  };

  if (!body || !Array.isArray(body.board) || body.board.length !== 9) {
    return reply.status(400).send({
      success: false,
      error: 'Invalid request body. Expected a 9x9 board array.'
    });
  }

  const result = getHint(body.board, body.preferredPos);
  if (!result.success) {
    return reply.status(422).send(result);
  }

  return result;
});

const PORT = Number(process.env.PORT) || 3001;
const HOST = process.env.HOST || '0.0.0.0';

const start = async () => {
  try {
    await server.listen({ port: PORT, host: HOST });
    console.log(`🚀 Fastify Server running at http://localhost:${PORT}`);
  } catch (err) {
    server.log.error(err);
    process.exit(1);
  }
};

start();