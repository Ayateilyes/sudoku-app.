import React from 'react';
import { BoardMatrix, Position } from '../types';
import { isSameBox } from '../utils/sudoku';
import { SudokuCell } from './SudokuCell';

interface SudokuGridProps {
  board: BoardMatrix;
  selectedPos: Position | null;
  conflicts: Set<string>;
  solvingPos?: Position | null;
  hintedPos?: Position | null;
  onSelectCell: (row: number, col: number) => void;
  onWheelCell?: (row: number, col: number, direction: 'up' | 'down') => void;
}

export const SudokuGrid: React.FC<SudokuGridProps> = ({
  board,
  selectedPos,
  conflicts,
  solvingPos = null,
  hintedPos = null,
  onSelectCell,
  onWheelCell,
}) => {
  const selectedCell = selectedPos ? board[selectedPos.row][selectedPos.col] : null;
  const selectedVal = selectedCell ? selectedCell.value : null;

  return (
    <div className="w-full max-w-[460px] mx-auto">
      <div
        className={`rounded-2xl p-2 sm:p-2.5 bg-slate-900/90 backdrop-blur-xl border-2 transition-all duration-300 ${
          conflicts.size > 0
            ? 'border-rose-600/70 shadow-[0_0_30px_rgba(244,63,94,0.25)]'
            : hintedPos
            ? 'border-amber-500/60 shadow-[0_0_30px_rgba(251,191,36,0.25)]'
            : solvingPos
            ? 'border-cyan-500/60 shadow-[0_0_30px_rgba(6,182,212,0.3)]'
            : 'border-slate-700/80 shadow-[0_12px_40px_rgba(0,0,0,0.55)]'
        }`}
      >
        <div className="grid grid-cols-9 rounded-xl overflow-hidden border border-slate-800 bg-slate-950/90 shadow-inner">
          {board.map((rowArr, r) =>
            rowArr.map((cell, c) => {
              const cellKey = `${r}-${c}`;
              const isSelected = selectedPos?.row === r && selectedPos?.col === c;
              const isHighlighted = !!(
                selectedPos &&
                (selectedPos.row === r ||
                  selectedPos.col === c ||
                  isSameBox(selectedPos.row, selectedPos.col, r, c))
              );
              const isSameValue = !!(selectedVal !== null && cell.value === selectedVal);
              const hasConflict = conflicts.has(cellKey);
              const isSolvingActive = solvingPos?.row === r && solvingPos?.col === c;
              const isHinted = hintedPos?.row === r && hintedPos?.col === c;

              return (
                <SudokuCell
                  key={cellKey}
                  cell={cell}
                  isSelected={isSelected}
                  isHighlighted={isHighlighted}
                  isSameValue={isSameValue}
                  hasConflict={hasConflict}
                  isSolvingActive={isSolvingActive}
                  isHinted={isHinted}
                  onSelect={onSelectCell}
                  onWheelCell={onWheelCell}
                />
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};