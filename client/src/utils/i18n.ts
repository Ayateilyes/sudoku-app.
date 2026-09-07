export type Language = 'de' | 'en';

export const translations = {
  de: {
    // Header & App
    appTitle: 'Sudoku Meister',
    dailyGlobalChallenge: 'Tägliche globale Herausforderung',
    interactivePuzzlesAndSolver: 'Interaktive Rätsel & Solver',
    online: 'Online',
    connecting: 'Verbinde...',

    // Language Toggle
    langButton: 'Sprache wechseln',

    // Roulette effect
    rouletteBadge: 'Mausrad-Roulette aktiv',
    rouletteTooltip: 'Drehe das Mausrad über einem Feld, um Zahlen wie im Roulette durchzuschalten',

    // Game modes
    classicSudoku: 'Klassisches Sudoku',
    dailyChallenge: 'Tägliche Herausforderung',
    streak: 'Serie',
    streakDays: 'Tage',
    completedToday: 'Heute abgeschlossen!',
    editNickname: 'Klicke, um den Spitznamen zu ändern',

    // Difficulties
    easy: 'Leicht',
    medium: 'Mittel',
    hard: 'Schwer',
    newPuzzle: 'Neues Rätsel',

    // Controls
    moves: 'Züge',
    conflict: 'Konflikt',
    conflicts: 'Konflikte',
    solved: 'Gelöst',
    hint: 'Hinweis',
    reset: 'Zurücksetzen',
    rulesTitle: 'Regeln & Stoppuhr:',
    rulesDesc: 'Wähle die Schwierigkeitsstufen, um Rätsel zu laden. Stoppuhr und Züge erfassen deine Leistung. Fülle alle 81 Felder fehlerfrei aus, um zu gewinnen!',

    // Solve bar
    solveWithBacktracking: 'Mit Backtracking-Algorithmus lösen',
    solverActive: 'Backtracking-Solver aktiv',
    paused: 'Pausiert',
    step: 'Schritt',
    instant: 'Sofort',
    finish: 'Abschließen',
    resumePlayback: 'Wiedergabe fortsetzen',
    pausePlayback: 'Wiedergabe pausieren',
    stopSolving: 'Lösen abbrechen',

    // Numberpad
    erase: 'Löschen',

    // Victory modal
    victoryDailyTitle: 'Tägliche Herausforderung gemeistert!',
    victoryClassicTitle: 'Rätsel erfolgreich gelöst!',
    victoryDailyDesc: 'Du hast das heutige weltweite Sudoku-Rätsel gemeistert!',
    victoryClassicDesc: 'Du hast das {difficulty}-Sudoku-Gitter erfolgreich geknackt!',
    currentStreakBanner: 'Aktuelle Serie: {count} Tage!',
    time: 'Zeit',
    hints: 'Hinweise',
    backToClassic: 'Zurück zu klassischen Rätseln',
    playAnother: 'Weiteres Rätsel spielen',

    // Footer
    footerTagline: 'Entwickelt für tägliches Gehirntraining & Rätselspaß',

    // Messages & Errors
    errSolveFailed: 'Sudoku-Rätsel konnte nicht gelöst werden.',
    errNetworkSolver: 'Netzwerkfehler. Verbindung zum Solver fehlgeschlagen.',
    errHintNotFound: 'Kein gültiger Hinweis für das aktuelle Spielfeld gefunden.',
    errNoPuzzlesFound: 'Keine Rätsel in der Datenbank gefunden.',
  },
  en: {
    // Header & App
    appTitle: 'Sudoku Master',
    dailyGlobalChallenge: 'Daily Global Challenge',
    interactivePuzzlesAndSolver: 'Interactive Puzzles & Solver',
    online: 'Online',
    connecting: 'Connecting...',

    // Language Toggle
    langButton: 'Change language',

    // Roulette effect
    rouletteBadge: 'Scroll Roulette Active',
    rouletteTooltip: 'Spin mouse wheel over any cell to cycle numbers like a roulette wheel',

    // Game modes
    classicSudoku: 'Classic Sudoku',
    dailyChallenge: 'Daily Challenge',
    streak: 'streak',
    streakDays: 'd',
    completedToday: 'Completed Today!',
    editNickname: 'Click to edit nickname',

    // Difficulties
    easy: 'Easy',
    medium: 'Medium',
    hard: 'Hard',
    newPuzzle: 'New Puzzle',

    // Controls
    moves: 'Moves',
    conflict: 'conflict',
    conflicts: 'conflicts',
    solved: 'Solved',
    hint: 'Hint',
    reset: 'Reset',
    rulesTitle: 'Rules & Timer:',
    rulesDesc: 'Select difficulty tabs to load puzzles. Timer and moves count your performance. Solve all 81 cells without conflicts to claim victory!',

    // Solve bar
    solveWithBacktracking: 'Solve with Backtracking Algorithm',
    solverActive: 'Backtracking Solver Active',
    paused: 'Paused',
    step: 'Step',
    instant: 'Instant',
    finish: 'Finish',
    resumePlayback: 'Resume Playback',
    pausePlayback: 'Pause Playback',
    stopSolving: 'Stop Solving',

    // Numberpad
    erase: 'Del',

    // Victory modal
    victoryDailyTitle: 'Daily Challenge Complete!',
    victoryClassicTitle: 'Puzzle Completed!',
    victoryDailyDesc: "You've successfully solved today's fixed challenge puzzle!",
    victoryClassicDesc: 'You cracked the {difficulty} Sudoku grid!',
    currentStreakBanner: 'Current Streak: {count} Days!',
    time: 'Time',
    hints: 'Hints',
    backToClassic: 'Back to Classic Puzzles',
    playAnother: 'Play Another Puzzle',

    // Footer
    footerTagline: 'Designed for daily brain training & puzzle mastery',

    // Messages & Errors
    errSolveFailed: 'Failed to solve Sudoku puzzle.',
    errNetworkSolver: 'Network error. Could not connect to puzzle solver.',
    errHintNotFound: 'Could not find a valid hint for current board.',
    errNoPuzzlesFound: 'No puzzles found in database.',
  },
};

export function getInitialLanguage(): Language {
  if (typeof window === 'undefined') return 'de';
  const saved = localStorage.getItem('sudoku_lang') as Language;
  if (saved === 'de' || saved === 'en') {
    return saved;
  }
  return 'de';
}