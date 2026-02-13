import { io, Socket } from 'socket.io-client';

let socket: Socket | null = null;

export const getSocket = (): Socket => {
  if (!socket) {
    socket = io({
      autoConnect: false,
    });
  }
  return socket;
};

export const connectSocket = () => {
  const s = getSocket();
  if (!s.connected) {
    s.connect();
  }
  return s;
};

export const disconnectSocket = () => {
  if (socket?.connected) {
    socket.disconnect();
  }
};

// Room events
export const createRoom = (level: string = 'easy'): Promise<{ success: boolean; roomId?: string; playerId?: string; error?: string; level?: string }> => {
  return new Promise((resolve) => {
    const s = getSocket();
    s.emit('create-room', { level }, (response: any) => {
      resolve(response);
    });
  });
};

export const joinRoom = (roomId: string): Promise<{ success: boolean; roomId?: string; playerId?: string; error?: string }> => {
  return new Promise((resolve) => {
    const s = getSocket();
    s.emit('join-room', { roomId }, (response: any) => {
      resolve(response);
    });
  });
};

export const leaveRoom = () => {
  const s = getSocket();
  s.emit('leave-room');
};

// Game events
export const flipCard = (cardIndex: number) => {
  const s = getSocket();
  s.emit('flip-card', { cardIndex });
};

export const restartGame = (): Promise<{ success: boolean; error?: string }> => {
  return new Promise((resolve) => {
    const s = getSocket();
    s.emit('restart-game', (response: any) => {
      resolve(response);
    });
  });
};

// Event listeners
export const onGameStart = (callback: (data: {
  roomId: string;
  level?: string;
  cols?: number;
  players: Array<{ id: string; name: string; score: number }>;
  cards: any[];
  currentTurn: string;
  totalPairs: number;
}) => void) => {
  const s = getSocket();
  s.on('game-start', callback);
};

export const onCardFlipped = (callback: (data: {
  cardIndex: number;
  playerId: string;
  isFirst: boolean;
}) => void) => {
  const s = getSocket();
  s.on('card-flipped', callback);
};

export const onMatchResult = (callback: (data: {
  matched: boolean;
  cardIndices: number[];
  playerId: string;
  score?: number;
}) => void) => {
  const s = getSocket();
  s.on('match-result', callback);
};

export const onTurnChange = (callback: (data: { currentTurn: string }) => void) => {
  const s = getSocket();
  s.on('turn-change', callback);
};

export const onGameOver = (callback: (data: { winnerId: string; winnerName: string }) => void) => {
  const s = getSocket();
  s.on('game-over', callback);
};

export const onPlayerDisconnected = (callback: (data: { disconnectedId: string; winnerId: string }) => void) => {
  const s = getSocket();
  s.on('player-disconnected', callback);
};

// Remove listeners
export const removeAllListeners = () => {
  const s = getSocket();
  s.off('game-start');
  s.off('card-flipped');
  s.off('match-result');
  s.off('turn-change');
  s.off('game-over');
  s.off('player-disconnected');
};
