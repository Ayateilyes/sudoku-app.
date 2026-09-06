import React from 'react';
import { motion } from 'framer-motion';
import { CellState } from '../types';

interface SudokuCellProps {
  cell: CellState;
  isSelected: boolean;
  isHighlighted: boolean;
  isSameValue: boolean;
  hasConflict: boolean;
  isSolvingActive?: boolean;
  isHinted?: boolean;
  onSelect: (row: number, col: number) => void;
}

export const SudokuCell: React.FC<SudokuCellProps> = React.memo(({
  cell,
  isSelected,
  isHighlighted,
  isSameValue,
  hasConflict,
  isSolvingActive = false,
  isHinted = false,
  onSelect,
}) => {
  const { row, col, value, isInitial } = cell;

  // 3x3 quadrant subgrid separator borders
  const rightBorder = col === 2 || col === 5 ? 'border-r-2 border-r-indigo-400/50' : 'border-r border-r-slate-800/70';
  const bottomBorder = row === 2 || row === 5 ? 'border-b-2 border-b-indigo-400/50' : 'border-b border-b-slate-800/70';
  const leftBorder = col === 0 ? 'border-l border-l-slate-700/60' : '';
  const topBorder = row === 0 ? 'border-t border-t-slate-700/60' : '';

  // Background and priority styling
  let bgClass = 'bg-slate-900/45 hover:bg-slate-800/40';
  let textClass = isInitial
    ? 'font-extrabold text-indigo-300 drop-shadow-[0_0_8px_rgba(99,102,241,0.2)]'
    : 'font-semibold text-slate-100';

  if (hasConflict) {
    bgClass = 'bg-rose-950/80 ring-2 ring-rose-500 ring-inset shadow-[0_0_16px_rgba(244,63,94,0.5)] z-20';
    textClass = isInitial ? 'font-black text-rose-300' : 'font-bold text-rose-200';
  } else if (isHinted) {
    bgClass = 'bg-amber-500/25 ring-2 ring-amber-400 ring-inset shadow-[0_0_20px_rgba(251,191,36,0.65)] z-20';
    textClass = 'font-black text-amber-200';
  } else if (isSolvingActive) {
    bgClass = 'bg-cyan-500/30 ring-2 ring-cyan-400 ring-inset shadow-[0_0_16px_rgba(6,182,212,0.6)] z-20';
    textClass = 'font-black text-cyan-200';
  } else if (isSelected) {
    bgClass = 'bg-indigo-600/30 ring-2 ring-indigo-400 ring-inset shadow-[0_0_14px_rgba(99,102,241,0.45)] z-10';
  } else if (isSameValue && value !== null) {
    bgClass = 'bg-indigo-950/70 text-indigo-200';
  } else if (isHighlighted) {
    bgClass = 'bg-slate-800/45';
  }

  return (
    <motion.button
      type="button"
      whileTap={{ scale: 0.94 }}
      // Strictly transform and opacity animations
      animate={
        hasConflict
          ? { x: [0, -6, 6, -5, 5, -2, 2, 0], opacity: 1 }
          : isHinted
          ? { scale: [1, 1.15, 1], opacity: [0.6, 1] }
          : isSolvingActive
          ? { scale: [1, 1.08, 1], opacity: 1 }
          : { x: 0, scale: 1, opacity: 1 }
      }
      transition={{
        duration: hasConflict ? 0.35 : isHinted ? 0.55 : 0.15,
        ease: 'easeInOut',
      }}
      onClick={() => onSelect(row, col)}
      aria-label={`Row ${row + 1}, Column ${col + 1}${value ? `, Value ${value}` : ', Empty'}${hasConflict ? ', Conflict' : ''}${isHinted ? ', Hinted' : ''}`}
      className={`relative aspect-square flex items-center justify-center select-none text-base sm:text-xl md:text-2xl transition-colors duration-150 focus:outline-none ${rightBorder} ${bottomBorder} ${leftBorder} ${topBorder} ${bgClass} ${textClass}`}
    >
      {value !== null ? (
        <motion.span
          key={`${row}-${col}-${value}`}
          initial={{ opacity: 0, scale: 0.7 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.12 }}
        >
          {value}
        </motion.span>
      ) : (
        <span className="opacity-0">·</span>
      )}

      {/* Conflict dot indicator */}
      {hasConflict && (
        <motion.span
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="absolute top-1 right-1 w-1.5 h-1.5 rounded-full bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,1)]"
        />
      )}

      {/* Hinted glow dot indicator */}
      {isHinted && (
        <motion.span
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="absolute top-1 right-1 w-1.5 h-1.5 rounded-full bg-amber-400 shadow-[0_0_8px_rgba(251,191,36,1)] animate-ping"
        />
      )}
    </motion.button>
  );
});