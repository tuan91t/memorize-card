import { create } from 'zustand';
import {
  connectSocket,
  disconnectSocket,
  createRoom,
  joinRoom,
  leaveRoom,
  flipCard as socketFlipCard,
  restartGame as socketRestartGame,
  onGameStart,
  onCardFlipped,
  onMatchResult,
  onTurnChange,
  onGameOver,
  onPlayerDisconnected,
  removeAllListeners,
} from '@/lib/socket';
import { Card } from '@/types/memory';

export interface Player {
  id: string;
  name: string;
  score: number;
}

type GameMode = 'single' | 'multi';
type ConnectionStatus = 'disconnected' | 'connecting' | 'connected' | 'error';

interface MultiplayerState {
  // Game mode
  gameMode: GameMode;
  
  // Connection
  connectionStatus: ConnectionStatus;
  
  // Room
  roomId: string | null;
  playerId: string | null;
  players: Player[];
  level: string;
  cols: number;
  
  // Game state
  cards: Card[];
  currentTurn: string | null;
  totalPairs: number;
  isGameStarted: boolean;
  isGameOver: boolean;
  winnerId: string | null;
  winnerName: string | null;
  
  // Disconnect handling
  opponentDisconnected: boolean;
  disconnectedWinner: boolean;
  
  // Actions
  setGameMode: (mode: GameMode) => void;
  setLevel: (level: string) => void;
  connect: () => void;
  disconnect: () => void;
  createNewRoom: (level?: string) => Promise<boolean>;
  joinExistingRoom: (roomId: string) => Promise<{ success: boolean; error?: string }>;
  flipCard: (cardIndex: number) => void;
  restartGame: () => Promise<boolean>;
  leaveGame: () => void;
  resetGame: () => void;
}

export const useMultiplayerStore = create<MultiplayerState>()((set, get) => ({
  // Initial state
  gameMode: 'single',
  connectionStatus: 'disconnected',
  roomId: null,
  playerId: null,
  players: [],
  level: 'easy',
  cols: 4,
  cards: [],
  currentTurn: null,
  totalPairs: 8,
  isGameStarted: false,
  isGameOver: false,
  winnerId: null,
  winnerName: null,
  opponentDisconnected: false,
  disconnectedWinner: false,

  setGameMode: (mode: GameMode) => {
    set({ gameMode: mode });
  },

  setLevel: (level: string) => {
    set({ level });
  },

  connect: () => {
    const socket = connectSocket();
    
    set({ connectionStatus: 'connecting' });

    socket.on('connect', () => {
      set({ connectionStatus: 'connected' });
    });

    socket.on('disconnect', () => {
      set({ connectionStatus: 'disconnected' });
    });

    // Game start event
    onGameStart((data) => {
      const cards = data.cards.map((card: any, index: number) => ({
        ...card,
        isFlipped: false,
        isMatched: false,
      }));

      set({
        roomId: data.roomId,
        players: data.players,
        level: data.level || 'easy',
        cols: data.cols || 4,
        cards,
        currentTurn: data.currentTurn,
        totalPairs: data.totalPairs,
        isGameStarted: true,
        isGameOver: false,
        winnerId: null,
        winnerName: null,
        opponentDisconnected: false,
        disconnectedWinner: false,
      });
    });

    // Card flipped event
    onCardFlipped((data) => {
      const { cards } = get();
      const newCards = cards.map((card) => {
        if (card.index === data.cardIndex) {
          return { ...card, isFlipped: true };
        }
        return card;
      });
      set({ cards: newCards });
    });

    // Match result event
    onMatchResult((data) => {
      const { cards, players } = get();
      
      if (data.matched) {
        const newCards = cards.map((card) => {
          if (data.cardIndices.includes(card.index)) {
            return { ...card, isMatched: true };
          }
          return card;
        });

        // Update player score
        const newPlayers = players.map((player) => {
          if (player.id === data.playerId) {
            return { ...player, score: data.score || player.score + 1 };
          }
          return player;
        });

        set({ cards: newCards, players: newPlayers });
      } else {
        // Flip back unmatched cards
        const newCards = cards.map((card) => {
          if (data.cardIndices.includes(card.index)) {
            return { ...card, isFlipped: false };
          }
          return card;
        });
        set({ cards: newCards });
      }
    });

    // Turn change event
    onTurnChange((data) => {
      set({ currentTurn: data.currentTurn });
    });

    // Game over event
    onGameOver((data) => {
      set({
        isGameOver: true,
        winnerId: data.winnerId,
        winnerName: data.winnerName,
      });
    });

    // Player disconnected event
    onPlayerDisconnected((data) => {
      const { playerId } = get();
      const isWinner = data.winnerId === playerId;
      
      set({
        opponentDisconnected: true,
        disconnectedWinner: isWinner,
        isGameOver: true,
        winnerId: data.winnerId,
      });
    });
  },

  disconnect: () => {
    removeAllListeners();
    disconnectSocket();
    set({
      connectionStatus: 'disconnected',
      roomId: null,
      playerId: null,
      players: [],
      cards: [],
      currentTurn: null,
      isGameStarted: false,
      isGameOver: false,
      winnerId: null,
      winnerName: null,
      opponentDisconnected: false,
      disconnectedWinner: false,
    });
  },

  createNewRoom: async (level?: string) => {
    const { connect, level: currentLevel } = get();
    const selectedLevel = level || currentLevel;
    
    // Ensure connected
    if (get().connectionStatus !== 'connected') {
      connect();
      // Wait a bit for connection
      await new Promise((resolve) => setTimeout(resolve, 500));
    }

    const result = await createRoom(selectedLevel);
    
    if (result.success) {
      set({
        roomId: result.roomId || null,
        playerId: result.playerId || null,
        level: result.level || selectedLevel,
      });
    }
    
    return result.success;
  },

  joinExistingRoom: async (roomId: string) => {
    const { connect } = get();
    
    // Ensure connected
    if (get().connectionStatus !== 'connected') {
      connect();
      await new Promise((resolve) => setTimeout(resolve, 500));
    }

    const result = await joinRoom(roomId);
    
    if (result.success) {
      set({
        roomId: result.roomId || null,
        playerId: result.playerId || null,
      });
    }
    
    return result;
  },

  flipCard: (cardIndex: number) => {
    const { currentTurn, playerId, isGameOver } = get();
    
    // Only allow flip if it's player's turn
    if (isGameOver || currentTurn !== playerId) return;
    
    socketFlipCard(cardIndex);
  },

  restartGame: async () => {
    const result = await socketRestartGame();
    return result.success;
  },

  leaveGame: () => {
    leaveRoom();
    get().disconnect();
  },

  resetGame: () => {
    set({
      roomId: null,
      playerId: null,
      players: [],
      level: 'easy',
      cols: 4,
      cards: [],
      currentTurn: null,
      totalPairs: 8,
      isGameStarted: false,
      isGameOver: false,
      winnerId: null,
      winnerName: null,
      opponentDisconnected: false,
      disconnectedWinner: false,
    });
  },
}));
