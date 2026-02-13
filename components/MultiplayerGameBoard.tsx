'use client';

import React from 'react';
import { useMultiplayerStore } from '@/store/multiplayerStore';
import Card from './MemoryCard';

export default function MultiplayerGameBoard() {
  const cards = useMultiplayerStore((state) => state.cards);
  const currentTurn = useMultiplayerStore((state) => state.currentTurn);
  const playerId = useMultiplayerStore((state) => state.playerId);
  const players = useMultiplayerStore((state) => state.players);
  const cols = useMultiplayerStore((state) => state.cols);
  const flipCard = useMultiplayerStore((state) => state.flipCard);
  
  // Dynamic maxWidth based on columns
  const maxWidth = cols <= 4 ? '400px' : cols <= 6 ? '600px' : '900px';
  
  const isMyTurn = currentTurn === playerId;
  
  // Find player names
  const currentPlayer = players.find(p => p.id === currentTurn);
  const myPlayer = players.find(p => p.id === playerId);
  
  return (
    <div className="w-full max-w-2xl mx-auto p-2">
      {/* Turn Indicator */}
      <div className="mb-4 flex justify-center">
        <div className={`px-6 py-2 rounded-full text-sm font-bold ${
          isMyTurn 
            ? 'bg-gradient-to-r from-green-500/30 to-emerald-500/30 border border-green-500/50 text-green-400' 
            : 'bg-slate-800/80 border border-slate-700 text-slate-400'
        }`}>
          {isMyTurn ? "🎯 Your Turn!" : `${currentPlayer?.name || 'Player'}'s Turn`}
        </div>
      </div>
      
      {/* Player Scores */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        {players.map((player) => {
          const isMe = player.id === playerId;
          const isTurn = player.id === currentTurn;
          
          return (
            <div 
              key={player.id}
              className={`p-3 rounded-xl border ${
                isTurn 
                  ? 'bg-gradient-to-br from-cyan-500/20 to-purple-500/20 border-cyan-500/50' 
                  : 'bg-slate-800/50 border-slate-700'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full ${isTurn ? 'bg-cyan-400 animate-pulse' : 'bg-slate-600'}`} />
                  <span className="text-white font-medium">
                    {isMe ? 'You' : player.name}
                  </span>
                </div>
                <div className="text-cyan-400 font-bold">
                  {player.score}
                </div>
              </div>
            </div>
          );
        })}
      </div>
      
      {/* Game Board */}
      <div 
        className="grid gap-2 mx-auto"
        style={{
          gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))`,
          maxWidth,
        }}
      >
        {cards.map((card) => (
          <button
            key={card.id}
            onClick={() => flipCard(card.index)}
            disabled={!isMyTurn}
            className={`${!isMyTurn ? 'cursor-not-allowed' : 'cursor-pointer'}`}
          >
            <Card 
              card={card} 
              onClick={() => {}} 
              disabled={!isMyTurn}
            />
          </button>
        ))}
      </div>
    </div>
  );
}
