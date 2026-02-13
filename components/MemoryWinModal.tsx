'use client';

import React from 'react';
import { useMemoryStore } from '@/store/memoryStore';
import { LEVELS } from '@/types/memory';
import { RefreshCw, Trophy } from 'lucide-react';

export default function WinModal() {
  const gameStatus = useMemoryStore((state) => state.gameStatus);
  const level = useMemoryStore((state) => state.level);
  const moves = useMemoryStore((state) => state.moves);
  const restartGame = useMemoryStore((state) => state.restartGame);
  
  if (gameStatus !== 'won') return null;
  
  const pairs = LEVELS[level].pairs;
  const perfectMoves = pairs; // Minimum possible moves
  
  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="relative bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl p-8 max-w-sm w-full border border-slate-700 shadow-2xl">
        {/* Glow effect */}
        <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/20 via-purple-500/20 to-pink-500/20 rounded-2xl blur-xl" />
        
        <div className="relative z-10 text-center">
          {/* Trophy icon */}
          <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center shadow-lg">
            <Trophy className="w-10 h-10 text-white" />
          </div>
          
          {/* Title */}
          <h2 className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-400 mb-2">
            You Won! 🎉
          </h2>
          
          {/* Level badge */}
          <div className="inline-block px-3 py-1 rounded-full bg-slate-700/50 text-slate-300 text-sm mb-4">
            {LEVELS[level].name} Mode
          </div>
          
          {/* Stats */}
          <div className="space-y-2 mb-6">
            <div className="flex items-center justify-center gap-2 text-slate-300">
              <span>Total Moves:</span>
              <span className="text-2xl font-bold text-white">{moves}</span>
            </div>
            <p className="text-sm text-slate-500">
              {moves <= perfectMoves ? 'Perfect! 🏆' : moves <= perfectMoves * 1.5 ? 'Great job! 👍' : 'Good effort! 💪'}
            </p>
          </div>
          
          {/* Play again button */}
          <button
            onClick={restartGame}
            className="w-full flex items-center justify-center gap-2 py-3 px-6 rounded-xl font-bold text-lg bg-gradient-to-r from-cyan-500 to-purple-500 text-white hover:from-cyan-400 hover:to-purple-400 transition-all transform hover:scale-105 shadow-lg"
          >
            <RefreshCw className="w-5 h-5" />
            Play Again
          </button>
        </div>
      </div>
    </div>
  );
}
