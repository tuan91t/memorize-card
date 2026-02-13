// Game Types for Pikachu Classic (Onet)

export type Difficulty = 'easy' | 'medium' | 'hard';

export interface Position {
  x: number;
  y: number;
}

export interface DifficultySettings {
  rows: number;
  cols: number;
  timeLimit: number; // in seconds
  name: string;
}

export type GameStatus = 'playing' | 'won' | 'lost' | 'paused';

export type Direction = 'up' | 'down' | 'left' | 'right';

export interface BFSState {
  x: number;
  y: number;
  direction: Direction | null;
  turns: number;
  path: Position[];
}

export interface GameSettings {
  difficulty: Difficulty;
  rows: number;
  cols: number;
  timeLimit: number;
}

export const DIFFICULTY_SETTINGS: Record<Difficulty, DifficultySettings> = {
  easy: {
    rows: 6,
    cols: 10,
    timeLimit: 300, // 5 minutes
    name: 'Easy',
  },
  medium: {
    rows: 8,
    cols: 12,
    timeLimit: 420, // 7 minutes
    name: 'Medium',
  },
  hard: {
    rows: 10,
    cols: 14,
    timeLimit: 600, // 10 minutes
    name: 'Hard',
  },
};

// Tile emoji mapping (1-12)
export const TILE_EMOJIS: Record<number, string> = {
  1: '🐭',
  2: '🐮',
  3: '🐯',
  4: '🐰',
  5: '🐲',
  6: '🐍',
  7: '🐴',
  8: '🐑',
  9: '🐵',
  10: '🐔',
  11: '🐶',
  12: '🐷',
};

export const NUM_TILE_TYPES = 12;
