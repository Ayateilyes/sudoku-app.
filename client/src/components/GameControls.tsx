import React from 'react';
import { motion } from 'framer-motion';
import { RotateCcw, Keyboard, HelpCircle, AlertTriangle, CheckCircle2, Check, Lightbulb, Clock, Footprints } from 'lucide-react';
import { Position } from '../types';

interface GameControlsProps {
  filledCount: number;
  conflictCount: number;
  hintsUsed: number;
  movesCount: number;
  timeFormatted: string;
  totalCells?: number;
  selectedPos: Position | null;
  isSolving?: boolean;
  onReset: () => void;
  onHint: () => void;
}

export const GameControls: React.FC<GameControlsProps> = ({
  filledCount,
  conflictCount,
  hintsUsed,
  movesCount,
  timeFormatted,
  totalCells = 81,
  selectedPos,
  isSolving = false,
  onReset,
  onHint,
}) => {
  const [showTips, setShowTips] = React.useState(false);

  return (
    <div className="w-full max-w-[460px] mx-auto mb-3">
      <div className="flex items-center justify-between px-3 py-2 rounded-xl bg-slate-900/60 border border-slate-800 text-xs text-slate-300">
        {/* Timer, Moves, and Progress */}
        <div className="flex items-center gap-3">
          {/* Timer */}
          <div className="flex items-center gap-1 font-mono text-indigo-300 font-semibold bg-indigo-950/40 px-2 py-0.5 rounded-md border border-indigo-500/20">
            <Clock className="w-3.5 h-3.5 text-indigo-400" />
            <span>{timeFormatted}</span>
          </div>

          {/* Moves */}
          <div className="hidden sm:flex items-center gap-1 text-slate-400 font-mono text-[11px]">
            <Footprints className="w-3.5 h-3.5 text-cyan-400" />
            <span>{movesCount}</span>
          </div>

          {/* Conflict status */}
          {conflictCount > 0 ? (
            <motion.span
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="flex items-center gap-1 px-2 py-0.5 rounded-md bg-rose-500/15 text-rose-300 border border-rose-500/30 font-medium text-[11px]"
            >
              <AlertTriangle className="w-3 h-3 text-rose-400" />
              <span>{conflictCount} conflict{conflictCount > 1 ? 's' : ''}</span>
            </motion.span>
          ) : filledCount === 81 ? (
            <span className="flex items-center gap-1 px-2 py-0.5 rounded-md bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 font-medium text-[11px]">
              <CheckCircle2 className="w-3 h-3 text-emerald-400" />
              <span>Solved</span>
            </span>
          ) : (
            <span className="hidden md:flex items-center gap-1 text-slate-400 text-[11px]">
              <Check className="w-3 h-3 text-emerald-400" />
              <span>{filledCount}/{totalCells}</span>
            </span>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-1.5">
          {selectedPos && (
            <span className="hidden lg:inline font-mono text-[11px] text-slate-400 bg-slate-800/80 px-1.5 py-0.5 rounded">
              [{selectedPos.row + 1},{selectedPos.col + 1}]
            </span>
          )}

          {/* Hint Button */}
          <motion.button
            type="button"
            whileHover={{ scale: isSolving ? 1 : 1.05 }}
            whileTap={{ scale: isSolving ? 1 : 0.95 }}
            disabled={isSolving || filledCount === 81}
            onClick={onHint}
            title="Reveal a correct cell hint"
            className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-amber-500/15 hover:bg-amber-500/25 text-amber-300 border border-amber-500/30 font-medium transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <Lightbulb className="w-3.5 h-3.5 text-amber-400" />
            <span>Hint</span>
            {hintsUsed > 0 && (
              <span className="text-[10px] bg-amber-400/20 px-1 rounded-full text-amber-200 ml-0.5 font-mono">
                {hintsUsed}
              </span>
            )}
          </motion.button>

          {/* Reset Button */}
          <motion.button
            type="button"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onReset}
            title="Reset puzzle to initial state"
            className="flex items-center gap-1 px-2 py-1 rounded-lg bg-slate-800 hover:bg-slate-700/80 text-slate-200 border border-slate-700/60 transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5 text-indigo-400" />
            <span className="hidden sm:inline">Reset</span>
          </motion.button>

          <button
            type="button"
            onClick={() => setShowTips(!showTips)}
            className="p-1.5 text-slate-400 hover:text-slate-200 rounded hover:bg-slate-800/60 transition-colors"
            title="Toggle Controls Guide"
          >
            <HelpCircle className="w-4 h-4" />
          </button>
        </div>
      </div>

      {showTips && (
        <motion.div
          initial={{ opacity: 0, y: -5 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-2 p-2.5 rounded-xl bg-slate-900/90 border border-indigo-500/20 text-[11px] text-slate-400 flex items-start gap-2"
        >
          <Keyboard className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
          <div>
            <strong className="text-slate-200">Rules & Timer:</strong> Select difficulty tabs to load puzzles . Timer and moves count your performance. Solve all 81 cells without conflicts to claim victory!
          </div>
        </motion.div>
      )}
    </div>
  );
};