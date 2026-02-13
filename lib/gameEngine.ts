/**
 * Pikachu Classic Game Engine
 * 
 * Core pathfinding algorithm using BFS with turn constraints.
 * Board must be padded with empty border to allow paths to go around tiles.
 */

import { Position, Direction, BFSState, NUM_TILE_TYPES } from '@/types/game';

// Direction vectors
const DIRECTIONS: { dx: number; dy: number; dir: Direction }[] = [
  { dx: 0, dy: -1, dir: 'up' },
  { dx: 0, dy: 1, dir: 'down' },
  { dx: -1, dy: 0, dir: 'left' },
  { dx: 1, dy: 0, dir: 'right' },
];

const MAX_TURNS = 2;

/**
 * Generate a board with valid pairs
 * Board is padded with 1-cell empty border on all sides
 * @param rows - Number of playable rows
 * @param cols - Number of playable columns
 * @returns 2D array with 0 = empty, 1-N = tile types
 */
export function generateBoard(rows: number, cols: number): number[][] {
  // Calculate actual board size with padding
  const paddedRows = rows + 2;
  const paddedCols = cols + 2;
  
  // Calculate number of pairs needed
  const totalTiles = rows * cols;
  const numPairs = totalTiles / 2;
  
  // Create array with pairs of tile types
  const tiles: number[] = [];
  for (let i = 0; i < numPairs; i++) {
    const tileType = (i % NUM_TILE_TYPES) + 1;
    tiles.push(tileType, tileType);
  }
  
  // Shuffle the tiles using Fisher-Yates
  for (let i = tiles.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [tiles[i], tiles[j]] = [tiles[j], tiles[i]];
  }
  
  // Create the padded board
  const board: number[][] = [];
  
  // Create empty first row (padding)
  board.push(new Array(paddedCols).fill(0));
  
  // Fill in the playable rows
  let tileIndex = 0;
  for (let y = 1; y <= rows; y++) {
    const row: number[] = [0]; // Left padding
    for (let x = 1; x <= cols; x++) {
      row.push(tiles[tileIndex++]);
    }
    row.push(0); // Right padding
    board.push(row);
  }
  
  // Create empty last row (padding)
  board.push(new Array(paddedCols).fill(0));
  
  return board;
}

/**
 * Check if a position is within board bounds
 */
function isInBounds(board: number[][], x: number, y: number): boolean {
  return y >= 0 && y < board.length && x >= 0 && x < board[0].length;
}

/**
 * Check if a cell is walkable (empty or is the target)
 */
function isWalkable(board: number[][], x: number, y: number, targetX: number, targetY: number): boolean {
  if (!isInBounds(board, x, y)) return false;
  
  // Empty cell is always walkable
  if (board[y][x] === 0) return true;
  
  // Target position is walkable even if it has a tile
  return x === targetX && y === targetY;
}

/**
 * Find connection path between two positions using BFS with turn constraints
 * @param board - The game board
 * @param start - Starting position
 * @param end - Target position
 * @returns Array of positions forming the path, or null if no valid path
 */
export function findConnectionPath(
  board: number[][], 
  start: Position, 
  end: Position
): Position[] | null {
  // Quick validation
  if (!isInBounds(board, start.x, start.y) || !isInBounds(board, end.x, end.y)) {
    return null;
  }
  
  // Must be different positions
  if (start.x === end.x && start.y === end.y) {
    return null;
  }
  
  // BFS with state tracking
  const queue: BFSState[] = [{
    x: start.x,
    y: start.y,
    direction: null,
    turns: 0,
    path: [start],
  }];
  
  // Visited set: key = "x,y,direction,turns"
  const visited = new Set<string>();
  visited.add(`${start.x},${start.y},null,0`);
  
  while (queue.length > 0) {
    const current = queue.shift()!;
    
    // Check if we reached the target
    if (current.x === end.x && current.y === end.y) {
      return current.path;
    }
    
    // Explore all 4 directions
    for (const { dx, dy, dir } of DIRECTIONS) {
      const newX = current.x + dx;
      const newY = current.y + dy;
      
      // Check if the new position is valid
      if (!isWalkable(board, newX, newY, end.x, end.y)) {
        continue;
      }
      
      // Calculate turns
      let newTurns = current.turns;
      if (current.direction !== null && current.direction !== dir) {
        newTurns += 1;
      }
      
      // Skip if too many turns
      if (newTurns > MAX_TURNS) {
        continue;
      }
      
      // Check visited
      const key = `${newX},${newY},${dir},${newTurns}`;
      if (visited.has(key)) {
        continue;
      }
      visited.add(key);
      
      // Add to queue
      queue.push({
        x: newX,
        y: newY,
        direction: dir,
        turns: newTurns,
        path: [...current.path, { x: newX, y: newY }],
      });
    }
  }
  
  // No path found
  return null;
}

/**
 * Check if two positions can be connected
 * @param board - The game board
 * @param posA - First position
 * @param posB - Second position
 * @returns true if tiles can be connected with ≤ 2 turns
 */
export function canConnect(
  board: number[][], 
  posA: Position, 
  posB: Position
): boolean {
  // Check if positions have same tile type
  if (!isInBounds(board, posA.x, posA.y) || !isInBounds(board, posB.x, posB.y)) {
    return false;
  }
  
  const tileA = board[posA.y][posA.x];
  const tileB = board[posB.y][posB.x];
  
  // Must be same non-zero tile type
  if (tileA === 0 || tileB === 0 || tileA !== tileB) {
    return false;
  }
  
  // Check if path exists
  return findConnectionPath(board, posA, posB) !== null;
}

/**
 * Check if there are any valid moves on the board
 * @param board - The game board
 * @returns true if there are possible moves
 */
export function hasPossibleMoves(board: number[][]): boolean {
  // Find all tile positions
  const tilePositions: Position[] = [];
  
  for (let y = 0; y < board.length; y++) {
    for (let x = 0; x < board[0].length; x++) {
      if (board[y][x] !== 0) {
        tilePositions.push({ x, y });
      }
    }
  }
  
  // Check all pairs
  for (let i = 0; i < tilePositions.length; i++) {
    for (let j = i + 1; j < tilePositions.length; j++) {
      const posA = tilePositions[i];
      const posB = tilePositions[j];
      
      // Only check same tile type
      if (board[posA.y][posA.x] === board[posB.y][posB.x]) {
        if (canConnect(board, posA, posB)) {
          return true;
        }
      }
    }
  }
  
  return false;
}

/**
 * Shuffle the board while preserving tile pairs
 * @param board - The current board
 * @returns New board with shuffled tiles
 */
export function shuffleBoard(board: number[][]): number[][] {
  // Clone the board
  const newBoard = board.map(row => [...row]);
  
  // Collect all non-zero tiles
  const tiles: number[] = [];
  for (let y = 0; y < newBoard.length; y++) {
    for (let x = 0; x < newBoard[0].length; x++) {
      if (newBoard[y][x] !== 0) {
        tiles.push(newBoard[y][x]);
      }
    }
  }
  
  // Shuffle the tiles
  for (let i = tiles.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [tiles[i], tiles[j]] = [tiles[j], tiles[i]];
  }
  
  // Place back on board
  let tileIndex = 0;
  for (let y = 0; y < newBoard.length; y++) {
    for (let x = 0; x < newBoard[0].length; x++) {
      if (newBoard[y][x] !== 0) {
        newBoard[y][x] = tiles[tileIndex++];
      }
    }
  }
  
  return newBoard;
}

/**
 * Remove tiles at given positions from board
 * @param board - The current board
 * @param posA - First position
 * @param posB - Second position
 * @returns New board with tiles removed
 */
export function removeTiles(
  board: number[][], 
  posA: Position, 
  posB: Position
): number[][] {
  const newBoard = board.map(row => [...row]);
  newBoard[posA.y][posA.x] = 0;
  newBoard[posB.y][posB.x] = 0;
  return newBoard;
}

/**
 * Check if board is empty (all tiles removed)
 * @param board - The game board
 * @returns true if board is empty
 */
export function isBoardEmpty(board: number[][]): boolean {
  for (let y = 0; y < board.length; y++) {
    for (let x = 0; x < board[0].length; x++) {
      if (board[y][x] !== 0) {
        return false;
      }
    }
  }
  return true;
}

/**
 * Get all valid moves on the board (for debugging/testing)
 * @param board - The game board
 * @returns Array of valid move pairs
 */
export function getAllValidMoves(board: number[][]): { posA: Position; posB: Position; path: Position[] }[] {
  const moves: { posA: Position; posB: Position; path: Position[] }[] = [];
  
  const tilePositions: Position[] = [];
  for (let y = 0; y < board.length; y++) {
    for (let x = 0; x < board[0].length; x++) {
      if (board[y][x] !== 0) {
        tilePositions.push({ x, y });
      }
    }
  }
  
  for (let i = 0; i < tilePositions.length; i++) {
    for (let j = i + 1; j < tilePositions.length; j++) {
      const posA = tilePositions[i];
      const posB = tilePositions[j];
      
      if (board[posA.y][posA.x] === board[posB.y][posB.x]) {
        const path = findConnectionPath(board, posA, posB);
        if (path) {
          moves.push({ posA, posB, path });
        }
      }
    }
  }
  
  return moves;
}
