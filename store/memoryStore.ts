/**
 * Zustand Store for Memory Card Game
 * 
 * Manages game state:
 * - Level selection
 * - Cards array
 * - Selected cards tracking
 * - Move counter
 * - Game status
 */

import { create } from 'zustand';
import { Card, GameStatus, Level, LEVELS } from '@/types/memory';
import { generateShuffledDeck, resetDeck } from '@/lib/deck';

interface MemoryGameState {
  // Game state
  level: Level;
  cards: Card[];
  firstSelected: string | null;
  secondSelected: string | null;
  isChecking: boolean;
  moves: number;
  gameStatus: GameStatus;

  // Actions
  setLevel: (level: Level) => void;
  initializeGame: (level: Level) => void;
  flipCard: (cardId: string) => void;
  resetSelection: () => void;
  checkForMatch: () => void;
  restartGame: () => void;
  goToMenu: () => void;
}

const MATCH_DELAY = 800; // ms before flipping back mismatched cards

export const useMemoryStore = create<MemoryGameState>()((set, get) => ({
  // Initial state - empty cards until level is selected
  level: 'easy',
  cards: [],
  firstSelected: null,
  secondSelected: null,
  isChecking: false,
  moves: 0,
  gameStatus: 'idle',

  // Set level and initialize game
  setLevel: (level: Level) => {
    const cards = generateShuffledDeck(level);
    set({
      level,
      cards,
      firstSelected: null,
      secondSelected: null,
      isChecking: false,
      moves: 0,
      gameStatus: 'playing',
    });
  },

  // Initialize game with shuffled deck
  initializeGame: (level: Level) => {
    const cards = generateShuffledDeck(level);
    set({
      level,
      cards,
      firstSelected: null,
      secondSelected: null,
      isChecking: false,
      moves: 0,
      gameStatus: 'playing',
    });
  },

  // Flip a card
  flipCard: (cardId: string) => {
    const state = get();
    
    // Prevent flipping during checking
    if (state.isChecking) return;
    
    // Prevent flipping already matched or flipped cards
    const card = state.cards.find(c => c.id === cardId);
    if (!card || card.isMatched || card.isFlipped) return;
    
    // Update card's flipped state
    const newCards = state.cards.map(c =>
      c.id === cardId ? { ...c, isFlipped: true } : c
    );
    
    if (!state.firstSelected) {
      // First card selection
      set({
        cards: newCards,
        firstSelected: cardId,
      });
    } else {
      // Second card selection
      set({
        cards: newCards,
        secondSelected: cardId,
        isChecking: true,
        moves: state.moves + 1,
      });
      
      // Check for match
      get().checkForMatch();
    }
  },

  // Check if selected cards match
  checkForMatch: () => {
    const state = get();
    const { firstSelected, secondSelected, cards } = state;
    
    if (!firstSelected || !secondSelected) return;
    
    const firstCard = cards.find(c => c.id === firstSelected);
    const secondCard = cards.find(c => c.id === secondSelected);
    
    if (!firstCard || !secondCard) {
      get().resetSelection();
      return;
    }
    
    if (firstCard.value === secondCard.value) {
      // Match found!
      const newCards = cards.map(c =>
        c.id === firstSelected || c.id === secondSelected
          ? { ...c, isMatched: true }
          : c
      );
      
      // Check for win
      const allMatched = newCards.every(c => c.isMatched);
      
      set({
        cards: newCards,
        firstSelected: null,
        secondSelected: null,
        isChecking: false,
        gameStatus: allMatched ? 'won' : 'playing',
      });
    } else {
      // No match - flip back after delay
      setTimeout(() => {
        const currentState = get();
        
        // Only flip back if we're still in checking state (game wasn't restarted)
        if (currentState.isChecking) {
          const revertedCards = currentState.cards.map(c =>
            c.id === firstSelected || c.id === secondSelected
              ? { ...c, isFlipped: false }
              : c
          );
          
          set({
            cards: revertedCards,
            firstSelected: null,
            secondSelected: null,
            isChecking: false,
          });
        }
      }, MATCH_DELAY);
    }
  },

  // Reset card selection
  resetSelection: () => {
    set({
      firstSelected: null,
      secondSelected: null,
      isChecking: false,
    });
  },

  // Go back to menu (level selection)
  goToMenu: () => {
    set({
      cards: [],
      firstSelected: null,
      secondSelected: null,
      isChecking: false,
      moves: 0,
      gameStatus: 'idle',
    });
  },

  // Restart game
  restartGame: () => {
    const { level } = get();
    const cards = resetDeck(level);
    set({
      cards,
      firstSelected: null,
      secondSelected: null,
      isChecking: false,
      moves: 0,
      gameStatus: 'playing',
    });
  },
}));
