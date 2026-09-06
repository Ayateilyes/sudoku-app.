import { BoardMatrix, CellState, CellValue } from '../types';

export const DEFAULT_RAW_PUZZLE: CellValue[][] = [
  [5, 3, null, null, 7, null, null, null, null],
  [6, null, null, 1, 9, 5, null, null, null],
  [null, 9, 8, null, null, null, null, 6, null],
  [8, null, null, null, 6, null, null, null, 3],
  [4, null, null, 8, null, 3, null, null, 1],
  [7, null, null, null, 2, null, null, null, 6],
  [null, 6, null, null, null, null, 2, 8, null],
  [null, null, null, 4, 1, 9, null, null, 5],
  [null, null, null, null, 8, null, null, 7, 9],
];

export function createInitialBoard(raw: CellValue[][] = DEFAULT_RAW_PUZZLE): BoardMatrix {
  return raw.map((rowArr, row) =>
    rowArr.map((val, col): CellState => ({
      row,
      col,
      value: val,
      isInitial: val !== null,
    }))
  );
}

export function cloneBoard(board: BoardMatrix): BoardMatrix {
  return board.map((row) => row.map((cell) => ({ ...cell })));
}

export function countFilledCells(board: BoardMatrix): number {
  let count = 0;
  for (let r = 0; r < 9; r++) {
    for (let c = 0; c < 9; c++) {
      if (board[r][c].value !== null) {
        count++;
      }
    }
  }
  return count;
}

export function isSameBox(r1: number, c1: number, r2: number, c2: number): boolean {
  return Math.floor(r1 / 3) === Math.floor(r2 / 3) && Math.floor(c1 / 3) === Math.floor(c2 / 3);
}

/**
 * Finds all cell coordinates that violate Sudoku rules (duplicate in same row, column, or 3x3 box).
 * Returns a Set of keys formatted as "row-col".
 */
export function findConflicts(board: BoardMatrix): Set<string> {
  const conflicts = new Set<string>();

  // 1. Check rows
  for (let r = 0; r < 9; r++) {
    const seen = new Map<number, number[]>();
    for (let c = 0; c < 9; c++) {
      const v = board[r][c].value;
      if (v !== null) {
        const arr = seen.get(v) || [];
        arr.push(c);
        seen.set(v, arr);
      }
    }
    seen.forEach((cols) => {
      if (cols.length > 1) {
        cols.forEach((c) => conflicts.add(`${r}-${c}`));
      }
    });
  }

  // 2. Check columns
  for (let c = 0; c < 9; c++) {
    const seen = new Map<number, number[]>();
    for (let r = 0; r < 9; r++) {
      const v = board[r][c].value;
      if (v !== null) {
        const arr = seen.get(v) || [];
        arr.push(r);
        seen.set(v, arr);
      }
    }
    seen.forEach((rows) => {
      if (rows.length > 1) {
        rows.forEach((r) => conflicts.add(`${r}-${c}`));
      }
    });
  }

  // 3. Check 3x3 subgrid boxes
  for (let boxRow = 0; boxRow < 3; boxRow++) {
    for (let boxCol = 0; boxCol < 3; boxCol++) {
      const seen = new Map<number, [number, number][]>();
      for (let r = 0; r < 3; r++) {
        for (let c = 0; c < 3; c++) {
          const actualR = boxRow * 3 + r;
          const actualC = boxCol * 3 + c;
          const v = board[actualR][actualC].value;
          if (v !== null) {
            const arr = seen.get(v) || [];
            arr.push([actualR, actualC]);
            seen.set(v, arr);
          }
        }
      }
      seen.forEach((cells) => {
        if (cells.length > 1) {
          cells.forEach(([r, c]) => conflicts.add(`${r}-${c}`));
        }
      });
    }
  }

  return conflicts;
}
