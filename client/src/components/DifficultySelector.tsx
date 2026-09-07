import React from 'react';
import { motion } from 'framer-motion';
import { RefreshCw, Zap } from 'lucide-react';
import { Difficulty } from '../types';
import { Language, translations } from '../utils/i18n';

interface DifficultySelectorProps {
  currentDifficulty: Difficulty;
  isLoading: boolean;
  isSolving: boolean;
  lang: Language;
  onSelectDifficulty: (difficulty: Difficulty) => void;
  onNewPuzzle: () => void;
}

export const DifficultySelector: React.FC<DifficultySelectorProps> = ({
  currentDifficulty,
  isLoading,
  isSolving,
  lang,
  onSelectDifficulty,
  onNewPuzzle,
}) => {
  const t = translations[lang];

  const difficulties: { key: Difficulty; label: string; activeColor: string }[] = [
    {
      key: 'EASY',
      label: t.easy,
      activeColor: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40 shadow-emerald-950/40',
    },
    {
      key: 'MEDIUM',
      label: t.medium,
      activeColor: 'bg-amber-500/20 text-amber-300 border-amber-500/40 shadow-amber-950/40',
    },
    {
      key: 'HARD',
      label: t.hard,
      activeColor: 'bg-rose-500/20 text-rose-300 border-rose-500/40 shadow-rose-950/40',
    },
  ];

  return (
    <div className="w-full max-w-[460px] mx-auto mb-3 flex items-center justify-between gap-2">
      {/* Segmented difficulty toggle */}
      <div className="flex items-center gap-1.5 p-1 rounded-xl bg-slate-900/80 border border-slate-800 shadow-inner">
        {difficulties.map((diff) => {
          const isActive = currentDifficulty === diff.key;

          return (
            <motion.button
              key={diff.key}
              type="button"
              whileHover={{ scale: isSolving || isLoading ? 1 : 1.04 }}
              whileTap={{ scale: isSolving || isLoading ? 1 : 0.96 }}
              disabled={isSolving || isLoading}
              onClick={() => onSelectDifficulty(diff.key)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all duration-150 ${
                isActive
                  ? `${diff.activeColor} shadow-md`
                  : 'border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              } disabled:opacity-40 disabled:cursor-not-allowed`}
            >
              {diff.label}
            </motion.button>
          );
        })}
      </div>

      {/* New Puzzle from DB Button */}
      <motion.button
        type="button"
        whileHover={{ scale: isSolving || isLoading ? 1 : 1.05 }}
        whileTap={{ scale: isSolving || isLoading ? 1 : 0.95 }}
        disabled={isSolving || isLoading}
        onClick={onNewPuzzle}
        title={t.newPuzzle}
        className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium bg-slate-900/80 hover:bg-slate-800 text-slate-200 border border-slate-700/80 hover:border-slate-600 shadow-sm transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
      >
        <RefreshCw className={`w-3.5 h-3.5 text-indigo-400 ${isLoading ? 'animate-spin' : ''}`} />
        <span className="hidden sm:inline">{t.newPuzzle}</span>
        <Zap className="w-3 h-3 text-amber-400 sm:hidden" />
      </motion.button>
    </div>
  );
};