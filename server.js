const { createServer } = require('http');
const { parse } = require('url');
const next = require('next');
const { Server } = require('socket.io');

const dev = process.env.NODE_ENV !== 'production';
const hostname = 'localhost';
const port = parseInt(process.env.PORT || '8080', 10);

const app = next({ dev, hostname, port });
const handle = app.getRequestHandler();

// Generate 4-character room ID
function generateRoomId() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let result = '';
  for (let i = 0; i < 4; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

// Level configurations
const LEVEL_CONFIGS = {
  easy: { pairs: 4, cols: 4, name: 'Easy' },
  medium: { pairs: 18, cols: 6, name: 'Medium' },
  hard: { pairs: 40, cols: 10, name: 'Hard' },
};

// Generate unique card ID
function generateCardId() {
  return Math.random().toString(36).substring(2, 9) + Date.now().toString(36);
}

// Generate shuffled deck (server-side for fairness)
function generateShuffledDeck(pairs = 8) {
  const values = [];
  for (let i = 0; i < pairs; i++) {
    values.push(i, i);
  }
  
  // Fisher-Yates shuffle
  for (let i = values.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [values[i], values[j]] = [values[j], values[i]];
  }
  
  return values.map((value, index) => ({
    id: generateCardId(),
    value,
    isFlipped: false,
    isMatched: false,
    index,
  }));
}

// In-memory room storage
const rooms = new Map();

app.prepare().then(() => {
  console.log('Next.js app prepared');

  const server = createServer(async (req, res) => {
    try {
      const parsedUrl = parse(req.url, true);
      await handle(req, res, parsedUrl);
    } catch (err) {
      console.error('Error occurred handling', req.url, err);
      res.statusCode = 500;
      res.end('internal server error');
    }
  });

  const io = new Server(server, {
    cors: {
      origin: '*',
      methods: ['GET', 'POST'],
    },
  });

  // Socket.io connection handling
  io.on('connection', (socket) => {
    console.log('Player connected:', socket.id);

    let currentRoomId = null;

    // Create a new room
    socket.on('create-room', (dataOrCallback, callback) => {
      // Handle both cases: emit('create-room', {level}) or emit('create-room', callback)
      let level = 'easy';
      let cb = callback;
      
      if (typeof dataOrCallback === 'function') {
        cb = dataOrCallback;
      } else if (dataOrCallback?.level) {
        level = dataOrCallback.level;
      }
      
      const levelConfig = LEVEL_CONFIGS[level] || LEVEL_CONFIGS.easy;
      
      let roomId = generateRoomId();
      
      // Ensure unique room ID
      while (rooms.has(roomId)) {
        roomId = generateRoomId();
      }

      const room = {
        id: roomId,
        level,
        cols: levelConfig.cols,
        players: [{
          id: socket.id,
          name: 'Player 1',
          score: 0,
        }],
        cards: [],
        currentTurn: socket.id,
        matchedPairs: 0,
        totalPairs: levelConfig.pairs,
        isOver: false,
        winner: null,
        firstSelection: null,
        isChecking: false,
      };

      rooms.set(roomId, room);
      currentRoomId = roomId;
      socket.join(roomId);

      console.log('Room created:', roomId, 'level:', level);
      
      if (cb && typeof cb === 'function') {
        cb({ success: true, roomId, playerId: socket.id, level });
      }
    });

    // Join an existing room
    socket.on('join-room', (data, callback) => {
      const { roomId } = data;
      const room = rooms.get(roomId);

      if (!room) {
        if (callback) {
          callback({ success: false, error: 'Room not found' });
        }
        return;
      }

      if (room.players.length >= 2) {
        if (callback) {
          callback({ success: false, error: 'Room is full' });
        }
        return;
      }

      // Add player 2
      room.players.push({
        id: socket.id,
        name: 'Player 2',
        score: 0,
      });

      // Generate cards and start game
      room.cards = generateShuffledDeck(room.totalPairs);
      room.currentTurn = room.players[0].id; // Player 1 starts

      currentRoomId = roomId;
      socket.join(roomId);

      console.log('Player joined room:', roomId, 'Total players:', room.players.length);

      // Notify all players in room
      io.to(roomId).emit('game-start', {
        roomId: room.id,
        level: room.level,
        cols: room.cols,
        players: room.players,
        cards: room.cards,
        currentTurn: room.currentTurn,
        totalPairs: room.totalPairs,
      });

      if (callback) {
        callback({ success: true, roomId, playerId: socket.id });
      }
    });

    // Flip a card
    socket.on('flip-card', (data) => {
      const { cardIndex } = data;
      const room = rooms.get(currentRoomId);

      console.log(`[FLIP] cardIndex=${cardIndex}, firstSelection=${room?.firstSelection}, isChecking=${room?.isChecking}`);

      if (!room || room.isOver) {
        console.log('[FLIP] REJECTED: no room or game over');
        return;
      }

      // Prevent clicking while checking for match
      if (room.isChecking) {
        console.log('[FLIP] REJECTED: isChecking is true');
        return;
      }

      // Check if it is this player's turn
      if (room.currentTurn !== socket.id) {
        console.log('[FLIP] REJECTED: not your turn');
        return;
      }

      // Find the card
      const card = room.cards.find(c => c.index === cardIndex);
      if (!card || card.isFlipped || card.isMatched) {
        console.log('[FLIP] REJECTED: card already flipped/matched');
        return;
      }

      // Flip the card
      card.isFlipped = true;

      console.log(`[FLIP] SUCCESS cardIndex=${cardIndex}, firstSelection=${room.firstSelection}, isFirst=${room.firstSelection === null}`);

      if (room.firstSelection === null) {
        // First card of the turn
        room.firstSelection = cardIndex;
        
        // Notify about card flip
        io.to(currentRoomId).emit('card-flipped', {
          cardIndex,
          playerId: socket.id,
          isFirst: true,
        });
      } else {
        // Second card - check for match
        // CRITICAL: Set isChecking FIRST to prevent race conditions
        room.isChecking = true;
        room.secondSelection = cardIndex;
        
        io.to(currentRoomId).emit('card-flipped', {
          cardIndex,
          playerId: socket.id,
          isFirst: false,
        });

        // Check match after a delay
        setTimeout(() => {
          const currentRoom = rooms.get(currentRoomId);
          if (!currentRoom || currentRoom.isOver) return;

          const card1 = currentRoom.cards.find(c => c.index === currentRoom.firstSelection);
          const card2 = currentRoom.cards.find(c => c.index === cardIndex);

          if (!card1 || !card2) {
            currentRoom.isChecking = false;
            currentRoom.firstSelection = null;
            return;
          }

          if (card1.value === card2.value) {
            // Match found!
            card1.isMatched = true;
            card2.isMatched = true;
            currentRoom.matchedPairs++;

            // Update player score
            const player = currentRoom.players.find(p => p.id === socket.id);
            if (player) {
              player.score++;
            }

            io.to(currentRoomId).emit('match-result', {
              matched: true,
              cardIndices: [currentRoom.firstSelection, cardIndex],
              playerId: socket.id,
              score: player ? player.score : 0,
            });

            // Check for win
            if (currentRoom.matchedPairs >= currentRoom.totalPairs) {
              currentRoom.isOver = true;
              currentRoom.winner = socket.id;

              io.to(currentRoomId).emit('game-over', {
                winnerId: socket.id,
                winnerName: player ? player.name : 'Unknown',
              });
            }

            // Same player continues after match
            currentRoom.firstSelection = null;
            currentRoom.isChecking = false;
          } else {
            // No match - flip back
            card1.isFlipped = false;
            card2.isFlipped = false;

            io.to(currentRoomId).emit('match-result', {
              matched: false,
              cardIndices: [currentRoom.firstSelection, cardIndex],
              playerId: socket.id,
            });

            // Switch turn
            const otherPlayer = currentRoom.players.find(p => p.id !== socket.id);
            if (otherPlayer) {
              currentRoom.currentTurn = otherPlayer.id;
            }

            io.to(currentRoomId).emit('turn-change', {
              currentTurn: currentRoom.currentTurn,
            });

            currentRoom.firstSelection = null;
            currentRoom.isChecking = false;
          }
        }, 800);
      }
    });

    // Restart game
    socket.on('restart-game', (callback) => {
      const room = rooms.get(currentRoomId);
      
      if (!room) {
        if (callback) {
          callback({ success: false, error: 'Room not found' });
        }
        return;
      }

      // Only host can restart
      if (room.players[0].id !== socket.id) {
        if (callback) {
          callback({ success: false, error: 'Only host can restart' });
        }
        return;
      }

      // Reset game
      room.cards = generateShuffledDeck(room.totalPairs);
      room.currentTurn = room.players[0].id;
      room.matchedPairs = 0;
      room.isOver = false;
      room.winner = null;
      room.firstSelection = null;
      room.isChecking = false;
      room.players.forEach(p => p.score = 0);

      io.to(currentRoomId).emit('game-start', {
        roomId: room.id,
        level: room.level,
        cols: room.cols,
        players: room.players,
        cards: room.cards,
        currentTurn: room.currentTurn,
        totalPairs: room.totalPairs,
      });

      if (callback) {
        callback({ success: true });
      }
    });

    // Leave room
    socket.on('leave-room', () => {
      handleDisconnect(socket, currentRoomId);
    });

    // Handle disconnect
    socket.on('disconnect', () => {
      console.log('Player disconnected:', socket.id);
      handleDisconnect(socket, currentRoomId);
    });

    function handleDisconnect(socket, roomId) {
      if (!roomId) return;
      
      const room = rooms.get(roomId);
      if (!room) return;

      const playerIndex = room.players.findIndex(p => p.id === socket.id);
      if (playerIndex === -1) return;

      // Remove player from room
      room.players.splice(playerIndex, 1);

      // Notify remaining player they won
      if (room.players.length === 1 && !room.isOver) {
        room.isOver = true;
        room.winner = room.players[0].id;

        io.to(roomId).emit('player-disconnected', {
          disconnectedId: socket.id,
          winnerId: room.players[0].id,
        });
      }

      // If no players left, delete room
      if (room.players.length === 0) {
        rooms.delete(roomId);
        console.log('Room deleted:', roomId);
      }

      socket.leave(roomId);
    }
  });

  server.listen(port, () => {
    console.log(`> Ready on http://${hostname}:${port}`);
  });
});
