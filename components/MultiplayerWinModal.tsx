'use client';

import React from 'react';
import { useMultiplayerStore } from '@/store/multiplayerStore';
import { RefreshCw, Trophy, UserX } from 'lucide-react';

export default function MultiplayerWinModal() {
  const {
    isGameOver,
    winnerId,
    winnerName,
    playerId,
    players,
    opponentDisconnected,
    disconnectedWinner,
    restartGame,
    leaveGame,
  } = useMultiplayerStore();

  if (!isGameOver) return null;

  const isWinner = winnerId === playerId;
  const isHost = players.length > 0 && players[0]?.id === playerId;

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="relative bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl p-8 max-w-sm w-full border border-slate-700 shadow-2xl">
        {/* Glow effect */}
        <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/20 via-purple-500/20 to-pink-500/20 rounded-2xl blur-xl" />
        
        <div className="relative z-10 text-center">
          {/* Icon */}
          <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center shadow-lg">
            {opponentDisconnected ? (
              <UserX className="w-10 h-10 text-white" />
            ) : (
              <Trophy className="w-10 h-10 text-white" />
            )}
          </div>
          
          {/* Title */}
          <h2 className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-400 mb-2">
            {opponentDisconnected 
              ? (disconnectedWinner ? 'You Win!' : 'You Lose!')
              : (isWinner ? 'You Win! 🎉' : 'You Lose!')
            }
          </h2>
          
          {/* Subtitle */}
          {opponentDisconnected ? (
            <p className="text-sm text-slate-400 mb-4">
              {disconnectedWinner 
                ? 'Your opponent disconnected' 
                : 'You disconnected'
              }
            </p>
          ) : (
            <p className="text-sm text-slate-400 mb-4">
              {winnerName} completed all pairs!
            </p>
          )}
          
          {/* Buttons */}
          <div className="space-y-3">
            {!opponentDisconnected && (
              <button
                onClick={restartGame}
                disabled={!isHost}
                className={`w-full flex items-center justify-center gap-2 py-3 px-6 rounded-xl font-bold text-lg transition-all transform shadow-lg ${
                  isHost 
                    ? 'bg-gradient-to-r from-cyan-500 to-purple-500 text-white hover:from-cyan-400 hover:to-purple-400 hover:scale-105' 
                    : 'bg-slate-700 text-slate-500 cursor-not-allowed'
                }`}
              >
                <RefreshCw className="w-5 h-5" />
                {isHost ? 'Play Again' : 'Waiting for host...'}
              </button>
            )}
            
            <button
              onClick={leaveGame}
              className="w-full py-3 px-6 rounded-xl font-bold text-white bg-slate-700 hover:bg-slate-600 transition-all"
            >
              Back to Menu
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
