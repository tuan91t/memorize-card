'use client';

import React from 'react';
import { useGameStore } from '@/store/useGameStore';
import { Trophy, Skull, RefreshCw, Play, Zap } from 'lucide-react';
import { Difficulty, DIFFICULTY_SETTINGS } from '@/types/game';

export default function GameOverModal() {
  const gameStatus = useGameStore((state) => state.gameStatus);
  const score = useGameStore((state) => state.score);
  const matches = useGameStore((state) => state.matches);
  const timeRemaining = useGameStore((state) => state.timeRemaining);
  const settings = useGameStore((state) => state.settings);
  const difficulty = useGameStore((state) => state.difficulty);
  
  const restartGame = useGameStore((state) => state.restartGame);
  const initGame = useGameStore((state) => state.initGame);
  const setDifficulty = useGameStore((state) => state.setDifficulty);
  
  const isVisible = gameStatus === 'won' || gameStatus === 'lost';
  
  if (!isVisible) return null;
  
  const isWin = gameStatus === 'won';
  
  // Calculate time bonus for win
  const timeBonus = isWin ? Math.floor(timeRemaining / 10) : 0;
  const totalScore = score + timeBonus;
  
  const handleDifficultyChange = (newDifficulty: Difficulty) => {
    setDifficulty(newDifficulty);
    initGame(newDifficulty);
  };
  
  return (
    <div className="modal-backdrop">
      <div className="relative bg-slate-900/95 backdrop-blur-xl rounded-2xl p-8 border-2 border-slate-700 max-w-md w-full mx-4 shadow-2xl">
        {/* Neon glow effect */}
        <div className={`
          absolute inset-0 rounded-2xl opacity-20 blur-3xl
          ${isWin ? 'bg-cyan-500' : 'bg-red-500'}
        `} />
        
        <div className="relative z-10">
          {/* Header */}
          <div className="flex flex-col items-center mb-8">
            <div className={`
              w-24 h-24 rounded-full flex items-center justify-center mb-4
              ${isWin 
                ? 'bg-gradient-to-br from-cyan-500/20 to-cyan-600/20 border-4 border-cyan-400' 
                : 'bg-gradient-to-br from-red-500/20 to-red-600/20 border-4 border-red-400'
              }
            `}>
              {isWin ? (
                <Trophy className="w-12 h-12 text-cyan-400" />
              ) : (
                <Skull className="w-12 h-12 text-red-400" />
              )}
            </div>
            
            <h2 className={`
              text-4xl font-black uppercase tracking-wider
              ${isWin ? 'text-cyan-400 neon-text' : 'text-red-400'}
            `}>
              {isWin ? 'You Win!' : "Time's Up!"}
            </h2>
            
            <p className="text-slate-400 mt-2">
              {isWin 
                ? 'Congratulations! You cleared the board!' 
                : 'Better luck next time!'
              }
            </p>
          </div>
          
          {/* Stats */}
          <div className="grid grid-cols-2 gap-4 mb-8">
            <div className="bg-slate-800/50 rounded-xl p-4 text-center border border-slate-700">
              <div className="text-sm text-slate-400 mb-1">Score</div>
              <div className="text-2xl font-bold text-white">{totalScore}</div>
            </div>
            <div className="bg-slate-800/50 rounded-xl p-4 text-center border border-slate-700">
              <div className="text-sm text-slate-400 mb-1">Matches</div>
              <div className="text-2xl font-bold text-white">{matches}</div>
            </div>
            <div className="bg-slate-800/50 rounded-xl p-4 text-center border border-slate-700">
              <div className="text-sm text-slate-400 mb-1">Difficulty</div>
              <div className="text-2xl font-bold text-white">{settings.name}</div>
            </div>
            <div className="bg-slate-800/50 rounded-xl p-4 text-center border border-slate-700">
              <div className="text-sm text-slate-400 mb-1">Time Left</div>
              <div className="text-2xl font-bold text-white">
                {isWin ? `${Math.floor(timeRemaining / 60)}:${(timeRemaining % 60).toString().padStart(2, '0')}` : '0:00'}
              </div>
            </div>
          </div>
          
          {/* Time bonus (only shown on win) */}
          {isWin && timeBonus > 0 && (
            <div className="flex items-center justify-center gap-2 mb-6 text-amber-400">
              <Zap className="w-5 h-5" />
              <span className="font-bold">+{timeBonus} Time Bonus!</span>
            </div>
          )}
          
          {/* Difficulty selector */}
          <div className="mb-6">
            <div className="text-sm text-slate-400 mb-3 text-center">Select Difficulty</div>
            <div className="flex gap-2 justify-center">
              {(Object.keys(DIFFICULTY_SETTINGS) as Difficulty[]).map((diff) => (
                <button
                  key={diff}
                  onClick={() => handleDifficultyChange(diff)}
                  className={`
                    px-4 py-2 rounded-lg font-bold uppercase text-sm transition-all
                    ${difficulty === diff 
                      ? 'bg-cyan-500/20 border-2 border-cyan-400 text-cyan-400' 
                      : 'bg-slate-800 border-2 border-slate-700 text-slate-400 hover:border-slate-500'
                    }
                  `}
                >
                  {DIFFICULTY_SETTINGS[diff].name}
                </button>
              ))}
            </div>
          </div>
          
          {/* Actions */}
          <div className="flex gap-4">
            <button
              onClick={restartGame}
              className="
                flex-1 flex items-center justify-center gap-2
                py-3 px-6 rounded-xl font-bold text-lg
                bg-gradient-to-r from-cyan-500 to-cyan-600
                text-white hover:from-cyan-400 hover:to-cyan-500
                transition-all transform hover:scale-105
                shadow-lg shadow-cyan-500/25
              "
            >
              <RefreshCw className="w-5 h-5" />
              Play Again
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
