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
      setSolverError('Could not load puzzle. Please check your connection.');
    } finally {
      setIsLoadingPuzzle(false);
    }
  }, []);

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
      setSolverError('Could not load daily challenge. Please try again.');
    } finally {
      setIsLoadingPuzzle(false);
    }
  }, [fetchStreak, nickname]);

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
      const data = await res.json();
      if (data.success) {
        setStreakData({
          nickname,
          current_streak: data.current_streak,
          last_played: new Date().toISOString().split('T')[0],
          has_played_today: true,
        });
      }
    } catch {
      // ignore
    }
  }, [nickname]);

  // Check victory condition
  useEffect(() => {
    if (!isSolving && filledCount === 81 && conflicts.size === 0 && !isVictory) {
      setIsVictory(true);
      setIsTimerRunning(false);
      if (gameMode === 'DAILY') {
        recordDailyCompletion();
      }
    }
  }, [filledCount, conflicts, isSolving, isVictory, gameMode, recordDailyCompletion]);

  // Cell Selection
  const handleSelectCell = useCallback(
    (row: number, col: number) => {
      if (isSolving) return;
      setSelectedPos({ row, col });
    },
    [isSolving]
  );

  // Set number in currently selected cell
  const handleInputNumber = useCallback(
    (num: number) => {
      if (isSolving || !selectedPos) return;
      const { row, col } = selectedPos;

      setBoard((prev) => {
        if (prev[row][col].isInitial) return prev;
        const next = cloneBoard(prev);
        const prevVal = next[row][col].value;
        next[row][col].value = prevVal === num ? null : num;

        if (prevVal !== num) {
          setMovesCount((m) => m + 1);
          if (!isTimerRunning) setIsTimerRunning(true);
        }
        return next;
      });
    },
    [isSolving, selectedPos, isTimerRunning]
  );

  // Erase number in currently selected cell
  const handleErase = useCallback(() => {
    if (isSolving || !selectedPos) return;
    const { row, col } = selectedPos;

    setBoard((prev) => {
      if (prev[row][col].isInitial) return prev;
      const next = cloneBoard(prev);
      if (next[row][col].value !== null) {
        next[row][col].value = null;
        setMovesCount((m) => m + 1);
      }
      return next;
    });
  }, [isSolving, selectedPos]);

  // Reset current puzzle
  const handleReset = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    if (hintTimeoutRef.current) {
      clearTimeout(hintTimeoutRef.current);
      hintTimeoutRef.current = null;
    }
    setIsSolving(false);
    setIsPaused(false);
    setSolvingPos(null);
    setHintedPos(null);
    setHintsUsed(0);
    setTimerSeconds(0);
    setMovesCount(0);
    setIsTimerRunning(false);
    setIsVictory(false);
    setSolverError(null);
    setBoard(createInitialBoard(initialRawBoard));
  }, [initialRawBoard]);

  // Request Hint from backend
  const handleGetHint = useCallback(async () => {
    if (isSolving) return;
    setSolverError(null);

    if (conflicts.size > 0) {
      setSolverError('Cannot provide hint: Resolve board conflicts first.');
      return;
    }

    try {
      const rawBoard = board.map((row) => row.map((cell) => cell.value));
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
        setSolverError(data.error || 'Failed to generate hint.');
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
      setHintsUsed((prev) => prev + 1);
      setMovesCount((m) => m + 1);
      if (!isTimerRunning) setIsTimerRunning(true);

      if (hintTimeoutRef.current) {
        clearTimeout(hintTimeoutRef.current);
      }
      hintTimeoutRef.current = window.setTimeout(() => {
        setHintedPos(null);
      }, 2500);
    } catch {
      setSolverError('Could not retrieve hint. Please try again.');
    }
  }, [board, selectedPos, isSolving, conflicts, isTimerRunning]);

  // Apply full final solution
  const applyFinalSolution = useCallback(() => {
    if (!solutionRef.current) return;
    const sol = solutionRef.current;
    setBoard((prev) =>
      prev.map((rowArr, r) =>
        rowArr.map((cell, c) => ({
          ...cell,
          value: sol[r][c],
        }))
      )
    );
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    setIsSolving(false);
    setIsPaused(false);
    setSolvingPos(null);
    setIsTimerRunning(false);
  }, []);

  // Cancel solving
  const handleCancelSolving = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    setIsSolving(false);
    setIsPaused(false);
    setSolvingPos(null);
  }, []);

  // Playback step runner
  const runPlayback = useCallback((startIndex: number) => {
    let index = startIndex;

    if (timerRef.current) {
      clearInterval(timerRef.current);
    }

    const getDelay = () => {
      if (speedRef.current === 'fast') return 8;
      return 26;
    };

    const tick = () => {
      if (isPausedRef.current) return;

      const steps = stepsRef.current;
      if (index >= steps.length) {
        applyFinalSolution();
        return;
      }

      const step = steps[index];
      setBoard((prev) => {
        const next = cloneBoard(prev);
        if (!next[step.row][step.col].isInitial) {
          next[step.row][step.col].value = step.value;
        }
        return next;
      });

      setSolvingPos({ row: step.row, col: step.col });
      setCurrentStepIndex(index + 1);
      index++;
    };

    timerRef.current = window.setInterval(tick, getDelay());
  }, [applyFinalSolution]);

  // Adjust speed during playback
  const handleSetSpeed = useCallback(
    (newSpeed: PlaybackSpeed) => {
      setSpeed(newSpeed);
      if (newSpeed === 'instant') {
        applyFinalSolution();
        return;
      }
      if (isSolving && !isPaused) {
        runPlayback(currentStepIndex);
      }
    },
    [applyFinalSolution, isSolving, isPaused, currentStepIndex, runPlayback]
  );

  // Toggle Pause/Resume
  const handleTogglePause = useCallback(() => {
    setIsPaused((prev) => {
      const next = !prev;
      if (!next) {
        runPlayback(currentStepIndex);
      } else if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
      return next;
    });
  }, [currentStepIndex, runPlayback]);

  // Trigger Solver API
  const handleSolve = async () => {
    setSolverError(null);

    if (conflicts.size > 0) {
      setSolverError('Cannot solve: Board contains conflicts. Please fix them first.');
      return;
    }

    try {
      const rawBoard = board.map((row) => row.map((cell) => cell.value));
      const res = await fetch(`${API_BASE}/api/solve`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ board: rawBoard }),
      });

      const data: SolveApiResponse = await res.json();

      if (!res.ok || !data.success || !data.solution) {
        setSolverError(data.error || 'Failed to solve Sudoku puzzle.');
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
      setSolverError('Network error. Could not connect to puzzle solver.');
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
        <header className="mb-4 p-4 rounded-2xl bg-slate-900/80 backdrop-blur-xl border border-slate-800/90 shadow-2xl flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600/30 to-purple-600/30 border border-indigo-500/40 flex items-center justify-center text-indigo-400 shadow-md shadow-indigo-950/50">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-lg sm:text-xl font-black tracking-tight bg-gradient-to-r from-white via-indigo-100 to-indigo-300 bg-clip-text text-transparent">
                Sudoku Master
              </h1>
              <p className="text-xs text-slate-400 flex items-center gap-1.5">
                {gameMode === 'DAILY' ? (
                  <>
                    <Flame className="w-3.5 h-3.5 text-amber-400" />
                    <span>Daily Global Challenge</span>
                  </>
                ) : (
                  <>
                    <span className="w-2 h-2 rounded-full bg-indigo-400 inline-block"></span>
                    <span>Interactive Puzzles & Solver</span>
                  </>
                )}
              </p>
            </div>
          </div>

          {/* Online Status Pill */}
          <div className="flex items-center gap-1.5 text-xs">
            {backendHealth?.status === 'ok' ? (
              <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-medium">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Online</span>
              </span>
            ) : (
              <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-800 text-slate-400 border border-slate-700">
                <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse"></span>
                <span>Connecting...</span>
              </span>
            )}
          </div>
        </header>

        {/* Daily Challenge vs Classic Selector & Streak Badge */}
        <DailyStreakCard
          gameMode={gameMode}
          dateString={dailyDate || new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
          nickname={nickname}
          streakData={streakData}
          onSelectMode={handleSelectMode}
          onUpdateNickname={handleUpdateNickname}
        />

        {/* Difficulty Selector Tabs (shown in Classic Mode) */}
        {gameMode === 'CLASSIC' && (
          <DifficultySelector
            currentDifficulty={difficulty}
            isLoading={isLoadingPuzzle}
            isSolving={isSolving}
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
        />

        {/* Solver Playback Bar */}
        <SolveBar
          isSolving={isSolving}
          isPaused={isPaused}
          currentStep={currentStepIndex}
          totalSteps={totalSteps}
          speed={speed}
          error={solverError}
          onSolve={handleSolve}
          onTogglePause={handleTogglePause}
          onSetSpeed={handleSetSpeed}
          onSkipToEnd={applyFinalSolution}
          onCancel={handleCancelSolving}
        />

        {/* Number Pad for Input & Erase */}
        <NumberPad
          board={board}
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
          onNewGame={() => (gameMode === 'DAILY' ? handleSelectMode('CLASSIC') : loadClassicPuzzle(difficulty))}
          onClose={() => setIsVictory(false)}
        />

        {/* Clean Footer banner */}
        <footer className="mt-6 p-3 rounded-xl bg-slate-900/40 border border-slate-800/60 text-center text-xs text-slate-500 flex items-center justify-between">
          <span className="flex items-center gap-1.5 text-[11px]">
            <ShieldCheck className="w-3.5 h-3.5 text-indigo-400" />
            Designed for daily brain training & puzzle mastery
          </span>
          <span className="text-[11px] text-slate-500 font-medium">
            Sudoku Master
          </span>
        </footer>
      </motion.div>
    </main>
  );
}