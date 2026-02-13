/**
 * Zustand Store for Pikachu Classic Game
 * 
 * Manages all game state including board, score, timer, and game status.
 */

import { create } from 'zustand';
import { 
  Difficulty, 
  Position, 
  GameStatus, 
  DIFFICULTY_SETTINGS,
  DifficultySettings 
} from '@/types/game';
import { 
  generateBoard, 
  canConnect, 
  findConnectionPath, 
  hasPossibleMoves, 
  shuffleBoard, 
  removeTiles,
  isBoardEmpty 
} from '@/lib/gameEngine';

interface GameState {
  // Game configuration
  difficulty: Difficulty;
  settings: DifficultySettings;
  
  // Game state
  board: number[][];
  selectedTile: Position | null;
  connectionPath: Position[] | null;
  score: number;
  matches: number;
  timeRemaining: number;
  gameStatus: GameStatus;
  
  // Animation states
  isAnimating: boolean;
  matchedTiles: Position[];
  shakePosition: Position | null;
  isShuffling: boolean;
  
  // Timer
  timerInterval: NodeJS.Timeout | null;
  
  // Actions
  initGame: (difficulty?: Difficulty) => void;
  restartGame: () => void;
  selectTile: (position: Position) => void;
  deselectTile: () => void;
  matchTiles: (posA: Position, posB: Position) => void;
  shuffleCurrentBoard: () => void;
  setGameStatus: (status: GameStatus) => void;
  decrementTimer: () => void;
  setDifficulty: (difficulty: Difficulty) => void;
  
  // Internal actions
  _clearMatchedTiles: () => void;
  _setShake: (position: Position | null) => void;
  _setAnimating: (animating: boolean) => void;
}

const POINTS_PER_MATCH = 10;

export const useGameStore = create<GameState>()((set, get) => ({
  // Initial state
  difficulty: 'medium',
  settings: DIFFICULTY_SETTINGS.medium,
  board: [],
  selectedTile: null,
  connectionPath: null,
  score: 0,
  matches: 0,
  timeRemaining: DIFFICULTY_SETTINGS.medium.timeLimit,
  gameStatus: 'playing',
  isAnimating: false,
  matchedTiles: [],
  shakePosition: null,
  isShuffling: false,
  timerInterval: null,
  
  // Initialize game with difficulty
  initGame: (difficulty?: Difficulty) => {
    const state = get();
    const newDifficulty = difficulty || state.difficulty;
    const settings = DIFFICULTY_SETTINGS[newDifficulty];
    
    // Generate board
    const board = generateBoard(settings.rows, settings.cols);
    
    // Clear any existing timer
    if (state.timerInterval) {
      clearInterval(state.timerInterval);
    }
    
    // Start timer
    const timerInterval = setInterval(() => {
      get().decrementTimer();
    }, 1000);
    
    set({
      difficulty: newDifficulty,
      settings,
      board,
      selectedTile: null,
      connectionPath: null,
      score: 0,
      matches: 0,
      timeRemaining: settings.timeLimit,
      gameStatus: 'playing',
      isAnimating: false,
      matchedTiles: [],
      shakePosition: null,
      isShuffling: false,
      timerInterval,
    });
  },
  
  // Restart current game
  restartGame: () => {
    const state = get();
    
    // Clear timer
    if (state.timerInterval) {
      clearInterval(state.timerInterval);
    }
    
    // Reinitialize
    get().initGame(state.difficulty);
  },
  
  // Select a tile
  selectTile: (position: Position) => {
    const state = get();
    
    if (state.isAnimating || state.gameStatus !== 'playing') return;
    
    const board = state.board;
    const tileValue = board[position.y][position.x];
    
    // Can't select empty tile
    if (tileValue === 0) return;
    
    // If nothing selected, select this tile
    if (!state.selectedTile) {
      set({ selectedTile: position });
      return;
    }
    
    // If same tile clicked, deselect
    if (state.selectedTile.x === position.x && state.selectedTile.y === position.y) {
      set({ selectedTile: null });
      return;
    }
    
    // Check if same tile type
    const selectedValue = board[state.selectedTile.y][state.selectedTile.x];
    
    if (selectedValue !== tileValue) {
      // Different tile type - shake and deselect
      set({ 
        selectedTile: null,
        shakePosition: position,
      });
      
      // Clear shake after animation
      setTimeout(() => {
        set({ shakePosition: null });
      }, 300);
      return;
    }
    
    // Check if can connect
    const path = findConnectionPath(board, state.selectedTile, position);
    
    if (!path) {
      // Can't connect - shake and deselect
      set({ 
        selectedTile: null,
        shakePosition: position,
      });
      
      setTimeout(() => {
        set({ shakePosition: null });
      }, 300);
      return;
    }
    
    // Valid match!
    get().matchTiles(state.selectedTile, position);
  },
  
  // Deselect current tile
  deselectTile: () => {
    set({ selectedTile: null });
  },
  
  // Match tiles and update state
  matchTiles: (posA: Position, posB: Position) => {
    const state = get();
    
    set({
      selectedTile: null,
      connectionPath: findConnectionPath(state.board, posA, posB),
      isAnimating: true,
      matchedTiles: [posA, posB],
    });
    
    // After animation, remove tiles
    setTimeout(() => {
      const newBoard = removeTiles(state.board, posA, posB);
      const newMatches = state.matches + 1;
      const newScore = state.score + POINTS_PER_MATCH;
      
      // Check win condition
      const won = isBoardEmpty(newBoard);
      
      // Check if any moves remain
      let shouldShuffle = false;
      if (!won && !hasPossibleMoves(newBoard)) {
        shouldShuffle = true;
      }
      
      set({
        board: newBoard,
        matches: newMatches,
        score: newScore,
        isAnimating: false,
        matchedTiles: [],
        connectionPath: null,
      });
      
      if (won) {
        // Game won!
        if (state.timerInterval) {
          clearInterval(state.timerInterval);
        }
        set({ gameStatus: 'won' });
      } else if (shouldShuffle) {
        // Auto shuffle
        setTimeout(() => {
          get().shuffleCurrentBoard();
        }, 500);
      }
    }, 400); // Wait for path animation
  },
  
  // Shuffle current board
  shuffleCurrentBoard: () => {
    const state = get();
    
    if (state.isAnimating) return;
    
    set({ isShuffling: true });
    
    // Shuffle and regenerate until there are possible moves
    let newBoard = shuffleBoard(state.board);
    let attempts = 0;
    const maxAttempts = 100;
    
    while (!hasPossibleMoves(newBoard) && attempts < maxAttempts) {
      newBoard = shuffleBoard(state.board);
      attempts++;
    }
    
    setTimeout(() => {
      set({
        board: newBoard,
        isShuffling: false,
        selectedTile: null,
        connectionPath: null,
      });
    }, 500);
  },
  
  // Set game status
  setGameStatus: (status: GameStatus) => {
    const state = get();
    
    if (status === 'playing' && state.gameStatus !== 'playing') {
      // Resume game - restart timer
      const timerInterval = setInterval(() => {
        get().decrementTimer();
      }, 1000);
      
      set({ gameStatus: status, timerInterval });
    } else {
      set({ gameStatus: status });
    }
  },
  
  // Decrement timer
  decrementTimer: () => {
    const state = get();
    
    if (state.gameStatus !== 'playing') return;
    
    const newTime = state.timeRemaining - 1;
    
    if (newTime <= 0) {
      // Time's up!
      if (state.timerInterval) {
        clearInterval(state.timerInterval);
      }
      set({ timeRemaining: 0, gameStatus: 'lost' });
    } else {
      set({ timeRemaining: newTime });
    }
  },
  
  // Set difficulty
  setDifficulty: (difficulty: Difficulty) => {
    set({ difficulty });
  },
  
  // Internal: Clear matched tiles (for animation reset)
  _clearMatchedTiles: () => {
    set({ matchedTiles: [] });
  },
  
  // Internal: Set shake position
  _setShake: (position: Position | null) => {
    set({ shakePosition: position });
  },
  
  // Internal: Set animating state
  _setAnimating: (animating: boolean) => {
    set({ isAnimating: animating });
  },
}));
