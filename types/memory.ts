// Memory Card Game Types

export interface Card {
  id: string;
  value: number;
  index: number;
  isFlipped: boolean;
  isMatched: boolean;
}

export type GameStatus = 'idle' | 'playing' | 'won';

export type Level = 'easy' | 'medium' | 'hard';

export interface LevelConfig {
  name: string;
  rows: number;
  cols: number;
  pairs: number;
  description: string;
}

export const LEVELS: Record<Level, LevelConfig> = {
  easy: {
    name: 'Easy',
    rows: 2,
    cols: 4,
    pairs: 4,
    description: '4×2 = 8 cards',
  },
  medium: {
    name: 'Medium',
    rows: 6,
    cols: 6,
    pairs: 18,
    description: '6×6 = 36 cards',
  },
  hard: {
    name: 'Hard',
    rows: 8,
    cols: 10,
    pairs: 40,
    description: '10×8 = 80 cards',
  },
};

// Extended emoji values for larger grids (up to 40 pairs)
export const CARD_VALUES = [
  '🍎', '🍊', '🍋', '🍇', '🍓', '🍒', '🥝', '🍑',
  '🥭', '🍍', '🥥', '🍌', '🍉', '🍈', '🍐', '🫐',
  '🫑', '🥦', '🥬', '🥒', '🌶️', '🫒', '🍄', '🥜',
  '🌰', '🍞', '🥐', '🥖', '🥨', '🧀', '🥚', '🍳',
  '🧈', '🥞', '🧇', '🥓', '🍔', '🍟', '🍕', '🌭',
];
