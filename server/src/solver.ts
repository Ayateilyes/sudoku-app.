export interface Step {
  row: number;
  col: number;
  value: number | null;
}

export interface SolveResult {
  success: boolean;
  solution: number[][] | null;
  steps: Step[];
  error?: string;
}

export interface HintResult {
  success: boolean;
  hint: {
    row: number;
    col: number;
    value: number;
  } | null;
  error?: string;
}

export function isValid(board: number[][], row: number, col: number, num: number): boolean {
  for (let i = 0; i < 9; i++) {
    if (board[row][i] === num && i !== col) return false;
    if (board[i][col] === num && i !== row) return false;
  }
  const startRow = Math.floor(row / 3) * 3;
  const startCol = Math.floor(col / 3) * 3;
  for (let r = 0; r < 3; r++) {
    for (let c = 0; c < 3; c++) {
      const curR = startRow + r;
      const curC = startCol + c;
      if (board[curR][curC] === num && (curR !== row || curC !== col)) return false;
    }
  }
  return true;
}

export function solveSudoku(rawBoard: (number | null)[][]): SolveResult {
  const grid: number[][] = rawBoard.map((row) =>
    row.map((val) => (val !== null && val >= 1 && val <= 9 ? val : 0))
  );
  const steps: Step[] = [];
  const MAX_STEPS = 2500;

  // Check if existing board has conflicts
  for (let r = 0; r < 9; r++) {
    for (let c = 0; c < 9; c++) {
      if (grid[r][c] !== 0) {
        const val = grid[r][c];
        if (!isValid(grid, r, c, val)) {
          return {
            success: false,
            solution: null,
            steps: [],
            error: 'Board contains conflicts. Please resolve them before solving.',
          };
        }
      }
    }
  }

  function backtrack(): boolean {
    for (let r = 0; r < 9; r++) {
      for (let c = 0; c < 9; c++) {
        if (grid[r][c] === 0) {
          for (let num = 1; num <= 9; num++) {
            if (isValid(grid, r, c, num)) {
              grid[r][c] = num;
              if (steps.length < MAX_STEPS) {
                steps.push({ row: r, col: c, value: num });
              }

              if (backtrack()) return true;

              grid[r][c] = 0;
              if (steps.length < MAX_STEPS) {
                steps.push({ row: r, col: c, value: null });
              }
            }
          }
          return false;
        }
      }
    }
    return true;
  }

  const solved = backtrack();

  if (!solved) {
    return {
      success: false,
      solution: null,
      steps: [],
      error: 'No valid solution exists for this Sudoku configuration.',
    };
  }

  if (steps.length >= MAX_STEPS) {
    for (let r = 0; r < 9; r++) {
      for (let c = 0; c < 9; c++) {
        if ((rawBoard[r][c] ?? 0) === 0) {
          steps.push({ row: r, col: c, value: grid[r][c] });
        }
      }
    }
  }

  return {
    success: true,
    solution: grid,
    steps,
  };
}

export function getHint(
  rawBoard: (number | null)[][],
  preferredPos?: { row: number; col: number } | null
): HintResult {
  // First solve the puzzle
  const solveRes = solveSudoku(rawBoard);
  if (!solveRes.success || !solveRes.solution) {
    return {
      success: false,
      hint: null,
      error: solveRes.error || 'Cannot calculate hint for an invalid puzzle.',
    };
  }

  const solution = solveRes.solution;

  // 1. If preferred position is provided and not already correctly filled
  if (
    preferredPos &&
    preferredPos.row >= 0 &&
    preferredPos.row < 9 &&
    preferredPos.col >= 0 &&
    preferredPos.col < 9
  ) {
    const { row, col } = preferredPos;
    const currentVal = rawBoard[row][col];
    if (currentVal !== solution[row][col]) {
      return {
        success: true,
        hint: {
          row,
          col,
          value: solution[row][col],
        },
      };
    }
  }

  // 2. Otherwise find an empty cell, prioritizing cells with fewer candidate choices
  type CandidateCell = { row: number; col: number; count: number; value: number };
  const candidates: CandidateCell[] = [];

  const currentGrid: number[][] = rawBoard.map((row) =>
    row.map((val) => (val !== null && val >= 1 && val <= 9 ? val : 0))
  );

  for (let r = 0; r < 9; r++) {
    for (let c = 0; c < 9; c++) {
      if (rawBoard[r][c] !== solution[r][c]) {
        let count = 0;
        for (let num = 1; num <= 9; num++) {
          if (isValid(currentGrid, r, c, num)) {
            count++;
          }
        }
        candidates.push({ row: r, col: c, count, value: solution[r][c] });
      }
    }
  }

  if (candidates.length === 0) {
    return {
      success: false,
      hint: null,
      error: 'The board is already completely and correctly solved!',
    };
  }

  // Sort by fewest candidates (easiest/most logical hint first)
  candidates.sort((a, b) => a.count - b.count);
  const best = candidates[0];

  return {
    success: true,
    hint: {
      row: best.row,
      col: best.col,
      value: best.value,
    },
  };
}
