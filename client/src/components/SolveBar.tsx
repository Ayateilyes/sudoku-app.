import React from 'react';
import { motion } from 'framer-motion';
import { Play, Pause, FastForward, Square, Wand2, AlertCircle } from 'lucide-react';

export type PlaybackSpeed = 'normal' | 'fast' | 'instant';

interface SolveBarProps {
  isSolving: boolean;
  isPaused: boolean;
  currentStep: number;
  totalSteps: number;
  speed: PlaybackSpeed;
  error: string | null;
  onSolve: () => void;
  onTogglePause: () => void;
  onSetSpeed: (speed: PlaybackSpeed) => void;
  onSkipToEnd: () => void;
  onCancel: () => void;
}

export const SolveBar: React.FC<SolveBarProps> = ({
  isSolving,
  isPaused,
  currentStep,
  totalSteps,
  speed,
  error,
  onSolve,
  onTogglePause,
  onSetSpeed,
  onSkipToEnd,
  onCancel,
}) => {
  return (
    <div className="w-full max-w-[460px] mx-auto mt-3.5">
      {/* Error Alert */}
      {error && (
        <motion.div
          initial={{ opacity: 0, y: -4 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-3 p-3 rounded-xl bg-rose-950/70 border border-rose-800/80 text-rose-300 text-xs flex items-center gap-2 shadow-lg shadow-rose-950/30"
        >
          <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
          <span>{error}</span>
        </motion.div>
      )}

      {!isSolving ? (
        <motion.button
          type="button"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={onSolve}
          className="w-full py-2.5 sm:py-3 px-4 rounded-xl font-bold text-xs sm:text-sm bg-gradient-to-r from-indigo-600 via-indigo-500 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white shadow-xl shadow-indigo-600/25 flex items-center justify-center gap-2 transition-all border border-indigo-400/30 hover:shadow-indigo-500/40"
        >
          <Wand2 className="w-4 h-4 text-indigo-200" />
          <span>Solve with Backtracking Algorithm</span>
        </motion.button>
      ) : (
        <motion.div
          initial={{ opacity: 0, y: 5 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-3 sm:p-3.5 rounded-xl bg-slate-900/90 border border-cyan-500/40 shadow-xl shadow-cyan-950/30"
        >
          {/* Top solving info */}
          <div className="flex items-center justify-between text-xs mb-2.5">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse"></span>
              <span className="font-semibold text-cyan-300">
                {isPaused ? 'Paused' : 'Backtracking Solver Active'}
              </span>
            </div>

            <span className="font-mono text-slate-400 text-[11px]">
              Step <strong className="text-cyan-300 font-bold">{currentStep}</strong> / {totalSteps}
            </span>
          </div>

          {/* Controls row */}
          <div className="flex items-center justify-between gap-2">
            {/* Speed toggle pills */}
            <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-lg border border-slate-800 text-[11px]">
              <button
                type="button"
                onClick={() => onSetSpeed('normal')}
                className={`px-2 py-0.5 sm:py-1 rounded font-medium transition-colors ${
                  speed === 'normal'
                    ? 'bg-indigo-600 text-white'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                1x
              </button>
              <button
                type="button"
                onClick={() => onSetSpeed('fast')}
                className={`px-2 py-0.5 sm:py-1 rounded font-medium transition-colors ${
                  speed === 'fast'
                    ? 'bg-indigo-600 text-white'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                3x
              </button>
              <button
                type="button"
                onClick={() => onSetSpeed('instant')}
                className={`px-2 py-0.5 sm:py-1 rounded font-medium transition-colors ${
                  speed === 'instant'
                    ? 'bg-indigo-600 text-white'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Instant
              </button>
            </div>

            {/* Action buttons */}
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={onTogglePause}
                title={isPaused ? 'Resume Playback' : 'Pause Playback'}
                className="p-1.5 sm:p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-colors"
              >
                {isPaused ? <Play className="w-4 h-4 text-emerald-400" /> : <Pause className="w-4 h-4" />}
              </button>

              <button
                type="button"
                onClick={onSkipToEnd}
                title="Finish Instantly"
                className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-medium transition-colors"
              >
                <FastForward className="w-3.5 h-3.5 text-cyan-400" />
                <span className="hidden sm:inline">Finish</span>
              </button>

              <button
                type="button"
                onClick={onCancel}
                title="Stop Solving"
                className="p-1.5 sm:p-2 rounded-lg bg-slate-800 hover:bg-rose-950/60 text-slate-400 hover:text-rose-300 border border-slate-700 transition-colors"
              >
                <Square className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
};