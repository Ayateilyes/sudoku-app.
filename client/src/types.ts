export type CellValue = number | null;

export interface CellState {
  row: number;
  col: number;
  value: CellValue;
  isInitial: boolean;
  isHinted?: boolean;
}

export type BoardMatrix = CellState[][];

export interface Position {
  row: number;
  col: number;
}

export interface SolverStep {
  row: number;
  col: number;
  value: number | null;
}

export interface SolveApiResponse {
  success: boolean;
  solution: number[][] | null;
  steps: SolverStep[];
  error?: string;
}

export interface HintApiResponse {
  success: boolean;
  hint: {
    row: number;
    col: number;
    value: number;
  } | null;
  error?: string;
}

export type Difficulty = 'EASY' | 'MEDIUM' | 'HARD';
export type GameMode = 'CLASSIC' | 'DAILY';

export interface DbPuzzle {
  id: number;
  difficulty: Difficulty;
  puzzle_data: (number | null)[][];
  solution_data: number[][];
}

export interface PuzzleApiResponse {
  success: boolean;
  puzzle: DbPuzzle;
  error?: string;
}

export interface DailyApiResponse {
  success: boolean;
  date: string;
  puzzle: DbPuzzle;
  error?: string;
}

export interface StreakData {
  nickname: string;
  current_streak: number;
  last_played: string | null;
  has_played_today: boolean;
}

export interface StreakApiResponse {
  success: boolean;
  nickname: string;
  current_streak: number;
  last_played: string | null;
  has_played_today: boolean;
  error?: string;
}