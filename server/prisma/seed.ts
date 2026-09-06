import { PrismaClient } from '@prisma/client';
import { solveSudoku } from '../src/solver.js';

const prisma = new PrismaClient();

const PUZZLES_TO_SEED = [
  {
    difficulty: 'EASY',
    puzzle_data: [
      [5, 3, null, null, 7, null, null, null, null],
      [6, null, null, 1, 9, 5, null, null, null],
      [null, 9, 8, null, null, null, null, 6, null],
      [8, null, null, null, 6, null, null, null, 3],
      [4, null, null, 8, null, 3, null, null, 1],
      [7, null, null, null, 2, null, null, null, 6],
      [null, 6, null, null, null, null, 2, 8, null],
      [null, null, null, 4, 1, 9, null, null, 5],
      [null, null, null, null, 8, null, null, 7, 9],
    ],
  },
  {
    difficulty: 'MEDIUM',
    puzzle_data: [
      [null, 2, null, 6, null, 8, null, null, null],
      [5, 8, null, null, null, 9, 7, null, null],
      [null, null, null, null, 4, null, null, null, null],
      [3, 7, null, null, null, null, 5, null, null],
      [6, null, null, null, null, null, null, null, 4],
      [null, null, 8, null, null, null, null, 1, 3],
      [null, null, null, null, 2, null, null, null, null],
      [null, null, 9, 8, null, null, null, 3, 6],
      [null, null, null, 3, null, 6, null, 9, null],
    ],
  },
  {
    difficulty: 'HARD',
    puzzle_data: [
      [null, null, null, 6, null, null, 4, null, null],
      [7, null, null, null, null, 3, 6, null, null],
      [null, null, null, null, 9, 1, null, 8, null],
      [null, null, null, null, null, null, null, null, null],
      [null, 5, null, 1, 8, null, null, null, 3],
      [null, null, null, 3, null, 6, null, 4, 5],
      [null, 4, null, 2, null, null, null, 6, null],
      [9, null, 3, null, null, null, null, null, null],
      [null, 2, null, null, null, null, 1, null, null],
    ],
  },
];

async function main() {
  console.log('🌱 Starting Sudoku Database Seed...');

  await prisma.dailyChallenge.deleteMany({});
  await prisma.puzzle.deleteMany({});

  for (const item of PUZZLES_TO_SEED) {
    const solved = solveSudoku(item.puzzle_data as (number | null)[][]);
    if (!solved.success || !solved.solution) {
      console.error(`Could not solve puzzle for difficulty ${item.difficulty}`);
      continue;
    }

    const created = await prisma.puzzle.create({
      data: {
        difficulty: item.difficulty,
        puzzle_data: item.puzzle_data,
        solution_data: solved.solution,
      },
    });

    console.log(`✓ Seeded ${item.difficulty} puzzle with ID: ${created.id}`);
  }

  const today = new Date().toISOString().split('T')[0];
  const firstPuzzle = await prisma.puzzle.findFirst({
    where: { difficulty: 'MEDIUM' },
  });

  if (firstPuzzle) {
    await prisma.dailyChallenge.upsert({
      where: { date: today },
      update: { puzzle_id: firstPuzzle.id },
      create: {
        date: today,
        puzzle_id: firstPuzzle.id,
      },
    });
    console.log(`✓ Daily Challenge configured for date: ${today}`);
  }

  console.log('✨ Seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });