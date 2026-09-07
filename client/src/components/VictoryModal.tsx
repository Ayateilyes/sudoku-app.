import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Trophy, Clock, Footprints, Lightbulb, Sparkles, ArrowRight, X, Flame } from 'lucide-react';
import { Difficulty } from '../types';
import { Language, translations } from '../utils/i18n';

interface VictoryModalProps {
  isOpen: boolean;
  difficulty: Difficulty;
  isDaily: boolean;
  streakCount: number;
  timeFormatted: string;
  movesCount: number;
  hintsUsed: number;
  lang: Language;
  onNewGame: () => void;
  onClose: () => void;
}

export const VictoryModal: React.FC<VictoryModalProps> = ({
  isOpen,
  difficulty,
  isDaily,
  streakCount,
  timeFormatted,
  movesCount,
  hintsUsed,
  lang,
  onNewGame,
  onClose,
}) => {
  const t = translations[lang];

  const diffLabel =
    difficulty === 'EASY'
      ? t.easy
      : difficulty === 'MEDIUM'
      ? t.medium
      : t.hard;

  const classicDesc = t.victoryClassicDesc.replace('{difficulty}', diffLabel);
  const streakBanner = t.currentStreakBanner.replace('{count}', streakCount.toString());

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
          <motion.div
            initial={{ opacity: 0, scale: 0.85 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.85 }}
            transition={{ duration: 0.25, ease: 'easeOut' }}
            className="w-full max-w-md p-6 rounded-2xl bg-slate-900 border-2 border-indigo-500/40 shadow-2xl shadow-indigo-950/80 text-center relative"
          >
            {/* Close button */}
            <button
              type="button"
              onClick={onClose}
              className="absolute top-4 right-4 p-1 text-slate-400 hover:text-slate-200 rounded-lg hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Trophy Icon */}
            <motion.div
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.1, duration: 0.3 }}
              className={`w-16 h-16 mx-auto mb-4 rounded-2xl border flex items-center justify-center shadow-lg ${
                isDaily
                  ? 'bg-gradient-to-tr from-amber-500/20 to-orange-500/20 border-amber-400/40 text-amber-400 shadow-amber-500/25'
                  : 'bg-gradient-to-tr from-indigo-500/20 to-purple-500/20 border-indigo-400/30 text-indigo-400 shadow-indigo-500/25'
              }`}
            >
              {isDaily ? <Flame className="w-9 h-9" /> : <Trophy className="w-8 h-8" />}
            </motion.div>

            <h2 className="text-2xl font-black tracking-tight text-white mb-1 flex items-center justify-center gap-2">
              {isDaily ? t.victoryDailyTitle : t.victoryClassicTitle}
              <Sparkles className="w-5 h-5 text-amber-400" />
            </h2>
            <p className="text-xs text-slate-400 mb-5">
              {isDaily ? t.victoryDailyDesc : classicDesc}
            </p>

            {/* Streak Callout Banner (if Daily) */}
            {isDaily && (
              <motion.div
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="mb-5 p-3 rounded-xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center gap-2 text-amber-300 font-bold"
              >
                <Flame className="w-5 h-5 text-amber-400 animate-pulse" />
                <span>{streakBanner}</span>
              </motion.div>
            )}

            {/* Stats Grid */}
            <div className="grid grid-cols-3 gap-2.5 mb-6">
              <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800/80 flex flex-col items-center">
                <Clock className="w-4 h-4 text-indigo-400 mb-1" />
                <span className="text-[11px] text-slate-400">{t.time}</span>
                <span className="font-mono font-bold text-sm text-slate-200">{timeFormatted}</span>
              </div>

              <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800/80 flex flex-col items-center">
                <Footprints className="w-4 h-4 text-cyan-400 mb-1" />
                <span className="text-[11px] text-slate-400">{t.moves}</span>
                <span className="font-mono font-bold text-sm text-slate-200">{movesCount}</span>
              </div>

              <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800/80 flex flex-col items-center">
                <Lightbulb className="w-4 h-4 text-amber-400 mb-1" />
                <span className="text-[11px] text-slate-400">{t.hints}</span>
                <span className="font-mono font-bold text-sm text-slate-200">{hintsUsed}</span>
              </div>
            </div>

            {/* Actions */}
            <motion.button
              type="button"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={onNewGame}
              className="w-full py-3 px-4 rounded-xl font-semibold text-sm bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white shadow-lg shadow-indigo-500/30 flex items-center justify-center gap-2 border border-indigo-400/30 transition-all"
            >
              <span>{isDaily ? t.backToClassic : t.playAnother}</span>
              <ArrowRight className="w-4 h-4" />
            </motion.button>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};