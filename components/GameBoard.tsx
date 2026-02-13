'use client';

import React, { useRef, useEffect, useState } from 'react';
import { useGameStore } from '@/store/useGameStore';
import Tile from './Tile';
import ConnectionLine from './ConnectionLine';

const TILE_SIZE = 60;
const GAP = 4;
const PADDING = 16;

export default function GameBoard() {
  const board = useGameStore((state) => state.board);
  const selectedTile = useGameStore((state) => state.selectedTile);
  const connectionPath = useGameStore((state) => state.connectionPath);
  const matchedTiles = useGameStore((state) => state.matchedTiles);
  const shakePosition = useGameStore((state) => state.shakePosition);
  const isShuffling = useGameStore((state) => state.isShuffling);
  const selectTile = useGameStore((state) => state.selectTile);
  const settings = useGameStore((state) => state.settings);
  
  const [showPath, setShowPath] = useState(false);
  
  // Show path animation
  useEffect(() => {
    if (connectionPath && connectionPath.length > 0) {
      setShowPath(true);
      const timer = setTimeout(() => {
        setShowPath(false);
      }, 350);
      return () => clearTimeout(timer);
    }
  }, [connectionPath]);
  
  // Calculate grid dimensions
  const gridStyle = {
    gridTemplateColumns: `repeat(${settings.cols + 2}, ${TILE_SIZE}px)`,
    gridTemplateRows: `repeat(${settings.rows + 2}, ${TILE_SIZE}px)`,
    gap: `${GAP}px`,
    padding: `${PADDING}px`,
  };
  
  // Calculate board dimensions for SVG overlay
  const boardWidth = (settings.cols + 2) * (TILE_SIZE + GAP) + PADDING * 2 - GAP;
  const boardHeight = (settings.rows + 2) * (TILE_SIZE + GAP) + PADDING * 2 - GAP;
  
  return (
    <div className="relative">
      {/* Shuffle overlay */}
      {isShuffling && (
        <div className="absolute inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-20 rounded-xl">
          <div className="text-cyan-400 text-2xl font-bold animate-pulse">
            🔀 Shuffling...
          </div>
        </div>
      )}
      
      {/* Game board grid */}
      <div 
        className="game-board relative bg-slate-900/80 rounded-xl border border-slate-700"
        style={gridStyle}
      >
        {/* Connection line SVG overlay */}
        {showPath && connectionPath && (
          <ConnectionLine 
            path={connectionPath}
            width={boardWidth}
            height={boardHeight}
            tileSize={TILE_SIZE}
            gap={GAP}
            padding={PADDING}
          />
        )}
        
        {/* Tiles */}
        {board.map((row, y) =>
          row.map((value, x) => {
            if (value === 0) return null;
            
            const position = { x, y };
            const isSelected = selectedTile?.x === x && selectedTile?.y === y;
            const isMatched = matchedTiles.some(
              (pos) => pos.x === x && pos.y === y
            );
            const isShaking = shakePosition?.x === x && shakePosition?.y === y;
            
            return (
              <Tile
                key={`${x}-${y}`}
                value={value}
                position={position}
                isSelected={isSelected}
                isMatched={isMatched}
                isShaking={isShaking}
                onClick={() => selectTile(position)}
              />
            );
          })
        )}
      </div>
    </div>
  );
}
