/**
 * Deck generation for Memory Card Game
 * Creates pairs based on level and shuffles them
 */

import { Card, CARD_VALUES, Level, LEVELS } from '@/types/memory';

/**
 * Generate a unique ID
 */
function generateId(): string {
  return Math.random().toString(36).substring(2, 9) + Date.now().toString(36);
}

/**
 * Generate a shuffled deck based on level
 * Uses Fisher-Yates shuffle algorithm
 */
export function generateShuffledDeck(level: Level): Card[] {
  const config = LEVELS[level];
  const numPairs = config.pairs;
  
  // Create pairs: duplicate each value
  const values: number[] = [];
  for (let i = 0; i < numPairs; i++) {
    values.push(i, i); // Each value appears twice
  }

  // Fisher-Yates shuffle
  for (let i = values.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [values[i], values[j]] = [values[j], values[i]];
  }

  // Create card objects
  return values.map((value, index) => ({
    id: generateId(),
    value,
    index,
    isFlipped: false,
    isMatched: false,
  }));
}

/**
 * Reset deck with new shuffle (uses current level)
 */
export function resetDeck(level: Level): Card[] {
  return generateShuffledDeck(level);
}
