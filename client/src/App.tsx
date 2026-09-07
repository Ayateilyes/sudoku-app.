import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { motion } from 'framer-motion';
import { Sparkles, CheckCircle2, ShieldCheck, Flame } from 'lucide-react';
import {
  BoardMatrix,
  Position,
  SolverStep,
  SolveApiResponse,
  HintApiResponse,
  Difficulty,
  GameMode,
  PuzzleApiResponse,
  DailyApiResponse,
  StreakData,
  StreakApiResponse,
} from './types';
import { createInitialBoard, cloneBoard, countFilledCells, findConflicts, DEFAULT_RAW_PUZZLE } from './utils/sudoku';
import { API_BASE } from './utils/api';
import { Language, translations, getInitialLanguage } from './utils/i18n';
import { SudokuGrid } from './components/SudokuGrid';
import { NumberPad } from './components/NumberPad';
import { GameControls } from './components/GameControls';
import { SolveBar, PlaybackSpeed } from './components/SolveBar';
import { DifficultySelector } from './components/DifficultySelector';
import { VictoryModal } from './components/VictoryModal';
import { DailyStreakCard } from './components/DailyStreakCard';

interface HealthResponse {
  status: string;
  timestamp: string;
  service: string;
  version: string;
}

export default function App() {
  // Language State (Defaults to Deutsch / German)
  const [lang, setLang] = useState<Language>(getInitialLanguage);
  const t = translations[lang];

  const handleToggleLanguage = (newLang: Language) => {
    setLang(newLang);
    if (typeof window !== 'undefined') {
      localStorage.setItem('sudoku_lang', newLang);
      document.documentElement.lang = newLang;
    }
  };

  const [board, setBoard] = useState<BoardMatrix>(() => createInitialBoard(DEFAULT_RAW_PUZZLE));
  const [initialRawBoard, setInitialRawBoard] = useState<(number | null)[][]>(DEFAULT_RAW_PUZZLE);
  const [selectedPos, setSelectedPos] = useState<Position | null>({ row: 0, col: 2 });
  const [backendHealth, setBackendHealth] = useState<HealthResponse | null>(null);

  // Mode and Daily/Streak state
  const [gameMode, setGameMode] = useState<GameMode>('CLASSIC');
  const [dailyDate, setDailyDate] = useState<string>('');
  const [nickname, setNickname] = useState<string>(() => {
    return localStorage.getItem('sudoku_nickname') || 'Player1';
  });
  const [streakData, setStreakData] = useState<StreakData | null>(null);

  // Difficulty & DB state
  const [difficulty, setDifficulty] = useState<Difficulty>('EASY');
  const [isLoadingPuzzle, setIsLoadingPuzzle] = useState<boolean>(false);

  // Game stats (Timer & Moves)
  const [timerSeconds, setTimerSeconds] = useState<number>(0);
  const [isTimerRunning, setIsTimerRunning] = useState<boolean>(false);
  const [movesCount, setMovesCount] = useState<number>(0);
  const [isVictory, setIsVictory] = useState<boolean>(false);

  // Solver State
  const [isSolving, setIsSolving] = useState<boolean>(false);
  const [isPaused, setIsPaused] = useState<boolean>(false);
  const [speed, setSpeed] = useState<PlaybackSpeed>('normal');
  const [solverError, setSolverError] = useState<string | null>(null);
  const [currentStepIndex, setCurrentStepIndex] = useState<number>(0);
  const [totalSteps, setTotalSteps] = useState<number>(0);
  const [solvingPos, setSolvingPos] = useState<Position | null>(null);

  // Hint State
  const [hintedPos, setHintedPos] = useState<Position | null>(null);
  const [hintsUsed, setHintsUsed] = useState<number>(0);

  const stepsRef = useRef<SolverStep[]>([]);
  const solutionRef = useRef<number[][] | null>(null);
  const isPausedRef = useRef<boolean>(false);
  const speedRef = useRef<PlaybackSpeed>('normal');
  const timerRef = useRef<number | null>(null);
  const hintTimeoutRef = useRef<number | null>(null);

  isPausedRef.current = isPaused;
  speedRef.current = speed;

  // Check Backend Health
  useEffect(() => {
    fetch(`${API_BASE}/api/health`)
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => setBackendHealth(data))
      .catch(() => setBackendHealth(null));
  }, []);

  // Timer Tick Effect
  useEffect(() => {
    let interval: number | null = null;
    if (isTimerRunning && !isPaused && !isSolving && !isVictory) {
      interval = window.setInterval(() => {
        setTimerSeconds((sec) => sec + 1);
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isTimerRunning, isPaused, isSolving, isVictory]);

  const formatTime = (totalSeconds: number): string => {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Fetch streak for current user
  const fetchStreak = useCallback(async (nick: string) => {
    try {
      const res = await fetch(`${API_BASE}/api/streak?nickname=${encodeURIComponent(nick)}`);
      const data: StreakApiResponse = await res.json();
      if (data.success) {
        setStreakData({
          nickname: data.nickname,
          current_streak: data.current_streak,
          last_played: data.last_played,
          has_played_today: data.has_played_today,
        });
      }
    } catch {
      // ignore
    }
  }, []);

  // Update nickname
  const handleUpdateNickname = useCallback((newNick: string) => {
    setNickname(newNick);
    localStorage.setItem('sudoku_nickname', newNick);
    fetchStreak(newNick);
  }, [fetchStreak]);

  // Load Classic Puzzle from DB
  const loadClassicPuzzle = useCallback(async (targetDifficulty: Difficulty) => {
    setIsLoadingPuzzle(true);
    setSolverError(null);
    setIsVictory(false);
    setIsTimerRunning(false);
    setTimerSeconds(0);
    setMovesCount(0);
    setHintsUsed(0);
    setHintedPos(null);

    try {
      const res = await fetch(`${API_BASE}/api/puzzles/random?difficulty=${targetDifficulty}`);
      const data: PuzzleApiResponse = await res.json();

      if (!res.ok || !data.success || !data.puzzle) {
        throw new Error(data.error || 'Failed to fetch puzzle.');
      }

      const raw = data.puzzle.puzzle_data;
      setInitialRawBoard(raw);
      setBoard(createInitialBoard(raw));
      setDifficulty(targetDifficulty);

      for (let r = 0; r < 9; r++) {
        for (let c = 0; c < 9; c++) {
          if (raw[r][c] === null) {
            setSelectedPos({ row: r, col: c });
            return;
          }
        }
      }
    } catch {
      setSolverError(lang === 'de' ? 'Rätsel konnte nicht geladen werden.' : 'Could not load puzzle. Please check your connection.');
    } finally {
      setIsLoadingPuzzle(false);
    }
  }, [lang]);

  // Load Daily Challenge Puzzle
  const loadDailyChallenge = useCallback(async () => {
    setIsLoadingPuzzle(true);
    setSolverError(null);
    setIsVictory(false);
    setIsTimerRunning(false);
    setTimerSeconds(0);
    setMovesCount(0);
    setHintsUsed(0);
    setHintedPos(null);

    try {
      const res = await fetch(`${API_BASE}/api/daily`);
      const data: DailyApiResponse = await res.json();

      if (!res.ok || !data.success || !data.puzzle) {
        throw new Error(data.error || 'Failed to fetch daily challenge.');
      }

      const raw = data.puzzle.puzzle_data;
      setDailyDate(data.date);
      setInitialRawBoard(raw);
      setBoard(createInitialBoard(raw));
      setDifficulty(data.puzzle.difficulty);

      for (let r = 0; r < 9; r++) {
        for (let c = 0; c < 9; c++) {
          if (raw[r][c] === null) {
            setSelectedPos({ row: r, col: c });
            break;
          }
        }
      }

      fetchStreak(nickname);
    } catch {
      setSolverError(lang === 'de' ? 'Tägliche Herausforderung konnte nicht geladen werden.' : 'Could not load daily challenge. Please try again.');
    } finally {
      setIsLoadingPuzzle(false);
    }
  }, [fetchStreak, nickname, lang]);

  // Initial load
  useEffect(() => {
    loadClassicPuzzle('EASY');
    fetchStreak(nickname);
  }, [loadClassicPuzzle, fetchStreak, nickname]);

  // Switch Game Mode
  const handleSelectMode = useCallback((mode: GameMode) => {
    setGameMode(mode);
    if (mode === 'DAILY') {
      loadDailyChallenge();
    } else {
      loadClassicPuzzle(difficulty);
    }
  }, [loadDailyChallenge, loadClassicPuzzle, difficulty]);

  // Live conflicts across board
  const conflicts = useMemo(() => findConflicts(board), [board]);
  const filledCount = countFilledCells(board);

  // Record completion for Daily Challenge
  const recordDailyCompletion = useCallback(async () => {
    try {
      const res = await fetch(`${API_BASE}/api/streak/complete`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nickname }),
      });
      const data: StreakApiResponse = await res.json();
      if (data.success) {
        setStreakData({
          nickname: data.nickname,
          current_streak: data.current_streak,
          last_played: data.last_played,
          has_played_today: true,
        });
      }
    } catch {
      // ignore
    }
  }, [nickname]);

  // Check victory condition
  useEffect(() => {
    if (filledCount === 81 && conflicts.size === 0 && !isSolving && !isVictory) {
      setIsVictory(true);
      setIsTimerRunning(false);

      if (gameMode === 'DAILY') {
        recordDailyCompletion();
      }
    }
  }, [filledCount, conflicts, isSolving, isVictory, gameMode, recordDailyCompletion]);

  // Cell Selection
  const handleSelectCell = useCallback((row: number, col: number) => {
    if (isSolving) return;
    setSelectedPos({ row, col });
  }, [isSolving]);

  // Start timer on first user move
  const startTimerIfNeeded = useCallback(() => {
    if (!isTimerRunning && !isVictory) {
      setIsTimerRunning(true);
    }
  }, [isTimerRunning, isVictory]);

  // Mouse wheel scroll roulette handler
  const handleWheelCell = useCallback((row: number, col: number, direction: 'up' | 'down') => {
    if (isSolving) return;
    const currentCell = board[row][col];
    if (currentCell.isInitial) return;

    startTimerIfNeeded();
    setSelectedPos({ row, col });

    setBoard((prev) => {
      const next = cloneBoard(prev);
      const currVal = next[row][col].value;
      let nextVal: number | null = null;

      if (direction === 'up') {
        // Roll up: empty -> 1 -> 2 -> ... -> 9 -> empty
        if (currVal === null) nextVal = 1;
        else if (currVal >= 9) nextVal = null;
        else nextVal = currVal + 1;
      } else {
        // Roll down: empty -> 9 -> 8 -> ... -> 1 -> empty
        if (currVal === null) nextVal = 9;
        else if (currVal <= 1) nextVal = null;
        else nextVal = currVal - 1;
      }

      next[row][col].value = nextVal;
      return next;
    });

    setMovesCount((m) => m + 1);
  }, [isSolving, board, startTimerIfNeeded]);

  // Input number into selected cell
  const handleInputNumber = useCallback((num: number) => {
    if (!selectedPos || isSolving) return;
    const { row, col } = selectedPos;
    const currentCell = board[row][col];

    if (currentCell.isInitial) return;

    startTimerIfNeeded();

    setBoard((prev) => {
      const next = cloneBoard(prev);
      next[row][col].value = num;
      return next;
    });

    setMovesCount((m) => m + 1);
  }, [selectedPos, isSolving, board, startTimerIfNeeded]);

  // Erase value from selected cell
  const handleErase = useCallback(() => {
    if (!selectedPos || isSolving) return;
    const { row, col } = selectedPos;
    const currentCell = board[row][col];

    if (currentCell.isInitial || currentCell.value === null) return;

    startTimerIfNeeded();

    setBoard((prev) => {
      const next = cloneBoard(prev);
      next[row][col].value = null;
      return next;
    });

    setMovesCount((m) => m + 1);
  }, [selectedPos, isSolving, board, startTimerIfNeeded]);

  // Reset to initial puzzle state
  const handleReset = useCallback(() => {
    if (isSolving) return;
    setBoard(createInitialBoard(initialRawBoard));
    setSolverError(null);
    setIsTimerRunning(false);
    setTimerSeconds(0);
    setMovesCount(0);
    setHintsUsed(0);
    setHintedPos(null);
  }, [initialRawBoard, isSolving]);

  // Intelligent Hint Fetcher
  const handleGetHint = useCallback(async () => {
    if (isSolving) return;

    setSolverError(null);
    startTimerIfNeeded();

    const rawBoard = board.map((row) => row.map((cell) => cell.value));

    try {
      const res = await fetch(`${API_BASE}/api/hint`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          board: rawBoard,
          preferredPos: selectedPos,
        }),
      });

      const data: HintApiResponse = await res.json();

      if (!res.ok || !data.success || !data.hint) {
        setSolverError(data.error || t.errHintNotFound);
        return;
      }

      const { row, col, value } = data.hint;

      setBoard((prev) => {
        const next = cloneBoard(prev);
        next[row][col].value = value;
        return next;
      });

      setSelectedPos({ row, col });
      setHintedPos({ row, col });
      setHintsUsed((h) => h + 1);
      setMovesCount((m) => m + 1);

      if (hintTimeoutRef.current) {
        window.clearTimeout(hintTimeoutRef.current);
      }
      hintTimeoutRef.current = window.setTimeout(() => {
        setHintedPos(null);
      }, 2500);
    } catch {
      setSolverError(t.errNetworkSolver);
    }
  }, [board, selectedPos, isSolving, startTimerIfNeeded, t]);

  // Cancel Solver Playback
  const handleCancelSolving = useCallback(() => {
    if (timerRef.current) {
      window.clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    setIsSolving(false);
    setIsPaused(false);
    setSolvingPos(null);
  }, []);

  // Apply final solved board instantly
  const applyFinalSolution = useCallback(() => {
    if (timerRef.current) {
      window.clearTimeout(timerRef.current);
      timerRef.current = null;
    }

    if (solutionRef.current) {
      const finalSolution = solutionRef.current;
      setBoard((prev) => {
        const next = cloneBoard(prev);
        for (let r = 0; r < 9; r++) {
          for (let c = 0; c < 9; c++) {
            next[r][c].value = finalSolution[r][c];
          }
        }
        return next;
      });
    }

    setIsSolving(false);
    setIsPaused(false);
    setSolvingPos(null);
    setCurrentStepIndex(totalSteps);
  }, [totalSteps]);

  // Run next step of playback
  const runPlayback = useCallback((stepIdx: number) => {
    if (stepIdx >= stepsRef.current.length) {
      applyFinalSolution();
      return;
    }

    if (isPausedRef.current) return;

    const step = stepsRef.current[stepIdx];
    setCurrentStepIndex(stepIdx + 1);
    setSolvingPos({ row: step.row, col: step.col });

    setBoard((prev) => {
      const next = cloneBoard(prev);
      next[step.row][step.col].value = step.value;
      return next;
    });

    const delay = speedRef.current === 'fast' ? 15 : 60;
    timerRef.current = window.setTimeout(() => {
      runPlayback(stepIdx + 1);
    }, delay);
  }, [applyFinalSolution]);

  // Toggle pause/resume during playback
  const handleTogglePause = useCallback(() => {
    if (!isSolving) return;

    if (isPaused) {
      setIsPaused(false);
      isPausedRef.current = false;
      runPlayback(currentStepIndex);
    } else {
      setIsPaused(true);
      isPausedRef.current = true;
      if (timerRef.current) {
        window.clearTimeout(timerRef.current);
        timerRef.current = null;
      }
    }
  }, [isSolving, isPaused, currentStepIndex, runPlayback]);

  // Change playback speed
  const handleSetSpeed = useCallback((newSpeed: PlaybackSpeed) => {
    setSpeed(newSpeed);
    speedRef.current = newSpeed;

    if (newSpeed === 'instant' && isSolving) {
      applyFinalSolution();
    }
  }, [isSolving, applyFinalSolution]);

  // Trigger Backtracking Solver
  const handleSolve = async () => {
    if (isSolving) return;

    setSolverError(null);
    const rawBoard = board.map((row) => row.map((cell) => cell.value));

    try {
      const res = await fetch(`${API_BASE}/api/solve`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ board: rawBoard }),
      });

      const data: SolveApiResponse = await res.json();

      if (!res.ok || !data.success || !data.solution) {
        setSolverError(data.error || t.errSolveFailed);
        return;
      }

      solutionRef.current = data.solution;
      stepsRef.current = data.steps;
      setTotalSteps(data.steps.length);
      setCurrentStepIndex(0);
      setIsSolving(true);
      setIsPaused(false);
      setIsTimerRunning(false);

      if (speed === 'instant') {
        applyFinalSolution();
      } else {
        runPlayback(0);
      }
    } catch {
      setSolverError(t.errNetworkSolver);
    }
  };

  // Keyboard navigation & number entry
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (isSolving) return;

      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return;
      }

      // Digits 1-9
      if (/^[1-9]$/.test(e.key)) {
        e.preventDefault();
        handleInputNumber(parseInt(e.key, 10));
        return;
      }

      // Erase
      if (e.key === 'Backspace' || e.key === 'Delete' || e.key === '0') {
        e.preventDefault();
        handleErase();
        return;
      }

      // Navigation
      if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key)) {
        e.preventDefault();
        setSelectedPos((curr) => {
          if (!curr) return { row: 0, col: 0 };
          let { row, col } = curr;
          if (e.key === 'ArrowUp') row = row > 0 ? row - 1 : 8;
          if (e.key === 'ArrowDown') row = row < 8 ? row + 1 : 0;
          if (e.key === 'ArrowLeft') col = col > 0 ? col - 1 : 8;
          if (e.key === 'ArrowRight') col = col < 8 ? col + 1 : 0;
          return { row, col };
        });
        return;
      }

      // Deselect
      if (e.key === 'Escape') {
        setSelectedPos(null);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isSolving, handleInputNumber, handleErase]);

  return (
    <main className="min-h-screen py-6 sm:py-10 px-3 sm:px-4 flex flex-col items-center justify-center text-slate-100">
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-xl flex flex-col"
      >
        {/* Top Header Card */}
        <header className="mb-4 p-4 rounded-2xl bg-slate-900/80 backdrop-blur-xl border border-slate-800/90 shadow-2xl flex items-center justify-between gap-2">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600/30 to-purple-600/30 border border-indigo-500/40 flex items-center justify-center text-indigo-400 shadow-md shadow-indigo-950/50">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-lg sm:text-xl font-black tracking-tight bg-gradient-to-r from-white via-indigo-100 to-indigo-300 bg-clip-text text-transparent">
                {t.appTitle}
              </h1>
              <p className="text-xs text-slate-400 flex items-center gap-1.5">
                {gameMode === 'DAILY' ? (
                  <>
                    <Flame className="w-3.5 h-3.5 text-amber-400" />
                    <span>{t.dailyGlobalChallenge}</span>
                  </>
                ) : (
                  <>
                    <span className="w-2 h-2 rounded-full bg-indigo-400 inline-block"></span>
                    <span>{t.interactivePuzzlesAndSolver}</span>
                  </>
                )}
              </p>
            </div>
          </div>

          {/* Right side: Language switcher & Online status */}
          <div className="flex items-center gap-2">
            {/* Language Switcher Pill */}
            <div className="flex items-center gap-0.5 bg-slate-950/90 p-1 rounded-xl border border-slate-800 shadow-inner">
              <button
                type="button"
                onClick={() => handleToggleLanguage('de')}
                className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
                  lang === 'de'
                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                }`}
                title="Deutsch (Standard)"
              >
                <span>🇩🇪</span>
                <span>DE</span>
              </button>
              <button
                type="button"
                onClick={() => handleToggleLanguage('en')}
                className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
                  lang === 'en'
                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                }`}
                title="English"
              >
                <span>🇬🇧</span>
                <span>EN</span>
              </button>
            </div>

            {/* Online Status Pill */}
            <div className="hidden sm:flex items-center gap-1.5 text-xs">
              {backendHealth?.status === 'ok' ? (
                <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-medium">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>{t.online}</span>
                </span>
              ) : (
                <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-800 text-slate-400 border border-slate-700">
                  <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse"></span>
                  <span>{t.connecting}</span>
                </span>
              )}
            </div>
          </div>
        </header>

        {/* Daily Challenge vs Classic Selector & Streak Badge */}
        <DailyStreakCard
          gameMode={gameMode}
          dateString={dailyDate || new Date().toLocaleDateString(lang === 'de' ? 'de-DE' : 'en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
          nickname={nickname}
          streakData={streakData}
          lang={lang}
          onSelectMode={handleSelectMode}
          onUpdateNickname={handleUpdateNickname}
        />

        {/* Difficulty Selector Tabs (shown in Classic Mode) */}
        {gameMode === 'CLASSIC' && (
          <DifficultySelector
            currentDifficulty={difficulty}
            isLoading={isLoadingPuzzle}
            isSolving={isSolving}
            lang={lang}
            onSelectDifficulty={(diff) => loadClassicPuzzle(diff)}
            onNewPuzzle={() => loadClassicPuzzle(difficulty)}
          />
        )}

        {/* Game Controls Bar with Timer and Moves */}
        <GameControls
          filledCount={filledCount}
          conflictCount={conflicts.size}
          hintsUsed={hintsUsed}
          movesCount={movesCount}
          timeFormatted={formatTime(timerSeconds)}
          selectedPos={selectedPos}
          isSolving={isSolving}
          lang={lang}
          onReset={handleReset}
          onHint={handleGetHint}
        />

        {/* 9x9 Sudoku Interactive Grid */}
        <SudokuGrid
          board={board}
          selectedPos={selectedPos}
          conflicts={conflicts}
          solvingPos={solvingPos}
          hintedPos={hintedPos}
          onSelectCell={handleSelectCell}
          onWheelCell={handleWheelCell}
        />

        {/* Interactive Scroll Wheel Roulette Game Effect Pill */}
        <div className="mt-2.5 flex items-center justify-center">
          <motion.div
            whileHover={{ scale: 1.03 }}
            className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-900/80 border border-indigo-500/25 text-[11px] text-slate-300 shadow-sm backdrop-blur-md cursor-default"
            title={t.rouletteTooltip}
          >
            <span className="text-xs">🎡</span>
            <span className="font-semibold text-indigo-300">{t.rouletteBadge}</span>
            <span className="text-[10px] text-slate-400 hidden sm:inline">• {t.rouletteTooltip}</span>
          </motion.div>
        </div>

        {/* Solver Playback Bar */}
        <SolveBar
          isSolving={isSolving}
          isPaused={isPaused}
          currentStep={currentStepIndex}
          totalSteps={totalSteps}
          speed={speed}
          error={solverError}
          lang={lang}
          onSolve={handleSolve}
          onTogglePause={handleTogglePause}
          onSetSpeed={handleSetSpeed}
          onSkipToEnd={applyFinalSolution}
          onCancel={handleCancelSolving}
        />

        {/* Number Pad for Input & Erase */}
        <NumberPad
          board={board}
          lang={lang}
          onInputNumber={handleInputNumber}
          onErase={handleErase}
          disabled={isSolving || isVictory}
        />

        {/* Victory Celebration Modal */}
        <VictoryModal
          isOpen={isVictory}
          difficulty={difficulty}
          isDaily={gameMode === 'DAILY'}
          streakCount={streakData?.current_streak ?? 1}
          timeFormatted={formatTime(timerSeconds)}
          movesCount={movesCount}
          hintsUsed={hintsUsed}
          lang={lang}
          onNewGame={() => (gameMode === 'DAILY' ? handleSelectMode('CLASSIC') : loadClassicPuzzle(difficulty))}
          onClose={() => setIsVictory(false)}
        />

        {/* Clean Footer banner */}
        <footer className="mt-6 p-3 rounded-xl bg-slate-900/40 border border-slate-800/60 text-center text-xs text-slate-500 flex items-center justify-between">
          <span className="flex items-center gap-1.5 text-[11px]">
            <ShieldCheck className="w-3.5 h-3.5 text-indigo-400" />
            {t.footerTagline}
          </span>
          <span className="text-[11px] text-slate-500 font-medium">
            {t.appTitle}
          </span>
        </footer>
      </motion.div>
    </main>
  );
}