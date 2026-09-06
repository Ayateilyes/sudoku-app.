import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Flame, Calendar, User, Edit2, Check, Grid, Sparkles, CheckCircle2 } from 'lucide-react';
import { GameMode, StreakData } from '../types';

interface DailyStreakCardProps {
  gameMode: GameMode;
  dateString: string;
  nickname: string;
  streakData: StreakData | null;
  onSelectMode: (mode: GameMode) => void;
  onUpdateNickname: (newNickname: string) => void;
}

export const DailyStreakCard: React.FC<DailyStreakCardProps> = ({
  gameMode,
  dateString,
  nickname,
  streakData,
  onSelectMode,
  onUpdateNickname,
}) => {
  const [isEditingNick, setIsEditingNick] = useState(false);
  const [tempNick, setTempNick] = useState(nickname);

  const handleSaveNick = () => {
    const trimmed = tempNick.trim();
    if (trimmed) {
      onUpdateNickname(trimmed);
    }
    setIsEditingNick(false);
  };

  return (
    <div className="w-full max-w-[460px] mx-auto mb-3">
      {/* Mode Switcher Tabs */}
      <div className="grid grid-cols-2 gap-1.5 p-1 rounded-xl bg-slate-900/80 border border-slate-800 shadow-inner mb-2.5">
        <motion.button
          type="button"
          whileHover={{ scale: 1.01 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => onSelectMode('CLASSIC')}
          className={`flex items-center justify-center gap-2 py-2 rounded-lg text-xs font-semibold border transition-all ${
            gameMode === 'CLASSIC'
              ? 'bg-indigo-600/30 text-indigo-200 border-indigo-500/40 shadow-sm'
              : 'border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
          }`}
        >
          <Grid className="w-3.5 h-3.5" />
          <span>Classic Sudoku</span>
        </motion.button>

        <motion.button
          type="button"
          whileHover={{ scale: 1.01 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => onSelectMode('DAILY')}
          className={`flex items-center justify-center gap-2 py-2 rounded-lg text-xs font-semibold border transition-all ${
            gameMode === 'DAILY'
              ? 'bg-amber-500/20 text-amber-300 border-amber-500/40 shadow-sm'
              : 'border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
          }`}
        >
          <Flame className={`w-3.5 h-3.5 ${gameMode === 'DAILY' ? 'text-amber-400' : ''}`} />
          <span>Daily Challenge</span>
          {streakData && streakData.current_streak > 0 && (
            <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-amber-500/30 text-amber-200 font-mono">
              {streakData.current_streak}d
            </span>
          )}
        </motion.button>
      </div>

      {/* Daily Challenge Info Header (shown when in Daily mode) */}
      {gameMode === 'DAILY' && (
        <motion.div
          initial={{ opacity: 0, y: -5 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25 }}
          className="p-3 rounded-xl bg-gradient-to-r from-amber-500/10 via-slate-900 to-indigo-500/10 border border-amber-500/30 shadow-lg flex items-center justify-between gap-3 text-xs"
        >
          {/* Date info */}
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400">
              <Calendar className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-1.5 font-bold text-white">
                <span>Daily Challenge</span>
                <Sparkles className="w-3 h-3 text-amber-400" />
              </div>
              <div className="text-[11px] text-slate-400 font-mono">{dateString}</div>
            </div>
          </div>

          {/* Nickname & Streak */}
          <div className="flex items-center gap-2">
            {/* Nickname Edit */}
            {isEditingNick ? (
              <div className="flex items-center gap-1 bg-slate-950 px-2 py-1 rounded-lg border border-slate-700">
                <input
                  type="text"
                  maxLength={15}
                  value={tempNick}
                  onChange={(e) => setTempNick(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSaveNick()}
                  className="w-20 bg-transparent text-xs text-white focus:outline-none"
                  autoFocus
                />
                <button
                  type="button"
                  onClick={handleSaveNick}
                  className="text-emerald-400 hover:text-emerald-300"
                >
                  <Check className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => {
                  setTempNick(nickname);
                  setIsEditingNick(true);
                }}
                className="flex items-center gap-1 text-[11px] text-slate-400 hover:text-slate-200 bg-slate-800/80 px-2 py-1 rounded-lg border border-slate-700/60 transition-colors"
                title="Click to edit nickname"
              >
                <User className="w-3 h-3 text-indigo-400" />
                <span className="font-semibold text-slate-300 max-w-[70px] truncate">{nickname}</span>
                <Edit2 className="w-2.5 h-2.5 text-slate-500" />
              </button>
            )}

            {/* Streak Counter Pill */}
            <motion.div
              animate={{ scale: [1, 1.04, 1] }}
              transition={{ repeat: Infinity, duration: 2.5 }}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-amber-500/20 border border-amber-500/40 text-amber-300 font-semibold"
            >
              <Flame className="w-3.5 h-3.5 text-amber-400" />
              <span className="font-mono">{streakData?.current_streak ?? 0}</span>
              <span className="text-[10px] font-normal text-amber-400/80">streak</span>
            </motion.div>

            {/* Done Today Badge */}
            {streakData?.has_played_today && (
              <div
                className="p-1 rounded-lg bg-emerald-500/20 border border-emerald-500/40 text-emerald-400"
                title="Completed Today!"
              >
                <CheckCircle2 className="w-4 h-4" />
              </div>
            )}
          </div>
        </motion.div>
      )}
    </div>
  );
};