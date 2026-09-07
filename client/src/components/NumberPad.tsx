import React from 'react';
import { motion } from 'framer-motion';
import { Delete } from 'lucide-react';
import { BoardMatrix } from '../types';
import { Language, translations } from '../utils/i18n';

interface NumberPadProps {
  board: BoardMatrix;
  lang?: Language;
  onInputNumber: (num: number) => void;
  onErase: () => void;
  disabled?: boolean;
}

export const NumberPad: React.FC<NumberPadProps> = ({
  board,
  lang = 'de',
  onInputNumber,
  onErase,
  disabled = false,
}) => {
  const t = translations[lang];

  const digitCounts = React.useMemo(() => {
    const counts: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0, 7: 0, 8: 0, 9: 0 };
    for (let r = 0; r < 9; r++) {
      for (let c = 0; c < 9; c++) {
        const v = board[r][c].value;
        if (v !== null && v >= 1 && v <= 9) {
          counts[v] = (counts[v] || 0) + 1;
        }
      }
    }
    return counts;
  }, [board]);

  const numbers = [1, 2, 3, 4, 5, 6, 7, 8, 9];

  return (
    <div className="w-full max-w-[460px] mx-auto mt-3.5">
      <div className="grid grid-cols-5 sm:grid-cols-10 gap-1.5 sm:gap-2">
        {numbers.map((num) => {
          const count = digitCounts[num];
          const isComplete = count >= 9;

          return (
            <motion.button
              key={num}
              type="button"
              whileHover={{ scale: disabled || isComplete ? 1 : 1.05 }}
              whileTap={{ scale: disabled || isComplete ? 1 : 0.92 }}
              transition={{ duration: 0.1 }}
              onClick={() => onInputNumber(num)}
              disabled={disabled || isComplete}
              className={`flex flex-col items-center justify-center py-2 sm:py-2.5 rounded-xl border transition-all ${
                isComplete
                  ? 'bg-slate-900/25 border-slate-850 text-slate-600 cursor-not-allowed'
                  : 'bg-slate-900/80 hover:bg-indigo-600/25 border-slate-750 hover:border-indigo-500/50 text-slate-100 shadow-sm active:bg-indigo-600/35 hover:shadow-[0_0_12px_rgba(99,102,241,0.25)]'
              }`}
            >
              <span className="text-base sm:text-lg font-bold">{num}</span>
              <span className={`text-[10px] font-mono -mt-0.5 ${isComplete ? 'text-emerald-500 font-bold' : 'text-slate-400'}`}>
                {isComplete ? '✓' : 9 - count}
              </span>
            </motion.button>
          );
        })}

        {/* Erase Button */}
        <motion.button
          type="button"
          whileHover={{ scale: disabled ? 1 : 1.05 }}
          whileTap={{ scale: disabled ? 1 : 0.92 }}
          transition={{ duration: 0.1 }}
          onClick={onErase}
          disabled={disabled}
          title={t.erase}
          className="flex flex-col items-center justify-center py-2 sm:py-2.5 rounded-xl border bg-slate-900/80 hover:bg-rose-500/20 border-slate-750 hover:border-rose-500/50 text-slate-300 hover:text-rose-300 shadow-sm transition-all hover:shadow-[0_0_12px_rgba(244,63,94,0.25)]"
        >
          <Delete className="w-4 h-4 sm:w-4.5 sm:h-4.5" />
          <span className="text-[10px] text-slate-400 -mt-0.5 font-mono truncate max-w-[40px]">{t.erase}</span>
        </motion.button>
      </div>
    </div>
  );
};