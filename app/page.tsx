'use client';

import React, { useState } from 'react';
import { useMemoryStore } from '@/store/memoryStore';
import { useMultiplayerStore } from '@/store/multiplayerStore';
import MemoryGameBoard from '@/components/MemoryGameBoard';
import MemoryWinModal from '@/components/MemoryWinModal';
import LevelSelection from '@/components/LevelSelection';
import RoomLobby from '@/components/RoomLobby';
import MultiplayerGameBoard from '@/components/MultiplayerGameBoard';
import MultiplayerWinModal from '@/components/MultiplayerWinModal';
import { RefreshCw, Trophy, ArrowLeft, Users, User } from 'lucide-react';

type GameMode = 'menu' | 'single' | 'multi';

export default function Home() {
  const [gameMode, setGameMode] = useState<GameMode>('menu');
  
  // Single player store
  const moves = useMemoryStore((state) => state.moves);
  const gameStatus = useMemoryStore((state) => state.gameStatus);
  const goToMenu = useMemoryStore((state) => state.goToMenu);
  const restartGame = useMemoryStore((state) => state.restartGame);
  
  // Multiplayer store
  const { isGameStarted, leaveGame } = useMultiplayerStore();

  const handleBackToMenu = () => {
    if (gameMode === 'single') {
      goToMenu();
    } else if (gameMode === 'multi') {
      leaveGame();
      useMultiplayerStore.getState().resetGame();
    }
    setGameMode('menu');
  };

  const handleRestart = () => {
    if (gameMode === 'single') {
      restartGame();
    } else if (gameMode === 'multi') {
      useMultiplayerStore.getState().restartGame();
    }
  };

  // Render game mode selection
  if (gameMode === 'menu') {
    return (
      <main className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 relative overflow-hidden">
        {/* Background decorations */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div 
            className="absolute inset-0 opacity-5"
            style={{
              backgroundImage: `
                linear-gradient(rgba(0,255,255,0.1) 1px, transparent 1px),
                linear-gradient(90deg, rgba(0,255,255,0.1) 1px, transparent 1px)
              `,
              backgroundSize: '50px 50px',
            }}
          />
          
          <div className="absolute top-1/4 -left-32 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl" />
          <div className="absolute bottom-1/4 -right-32 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-pink-500/5 rounded-full blur-3xl" />
        </div>
        
        <div className="relative z-10 container mx-auto px-4 py-8 flex flex-col items-center justify-center min-h-screen">
          {/* Title */}
          <div className="text-center mb-12">
            <h1 className="text-5xl md:text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400 neon-text">
              Memory Match
            </h1>
            <p className="text-slate-400 mt-2">Find all the matching pairs!</p>
          </div>
          
          {/* Game Mode Selection */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-2xl px-4">
            {/* Single Player */}
            <button
              onClick={() => setGameMode('single')}
              className="group p-8 rounded-2xl bg-slate-800/50 border-2 border-slate-700 hover:border-cyan-500/50 transition-all hover:scale-105"
            >
              <div className="flex flex-col items-center gap-4">
                <div className="w-20 h-20 rounded-full bg-gradient-to-br from-cyan-500/20 to-purple-500/20 flex items-center justify-center border border-cyan-500/50 group-hover:border-cyan-400 transition-colors">
                  <User className="w-10 h-10 text-cyan-400" />
                </div>
                <div className="text-center">
                  <h2 className="text-2xl font-bold text-white mb-1">Single Player</h2>
                  <p className="text-slate-400 text-sm">Play against yourself</p>
                </div>
              </div>
            </button>
            
            {/* Multiplayer */}
            <button
              onClick={() => setGameMode('multi')}
              className="group p-8 rounded-2xl bg-slate-800/50 border-2 border-slate-700 hover:border-purple-500/50 transition-all hover:scale-105"
            >
              <div className="flex flex-col items-center gap-4">
                <div className="w-20 h-20 rounded-full bg-gradient-to-br from-purple-500/20 to-pink-500/20 flex items-center justify-center border border-purple-500/50 group-hover:border-purple-400 transition-colors">
                  <Users className="w-10 h-10 text-purple-400" />
                </div>
                <div className="text-center">
                  <h2 className="text-2xl font-bold text-white mb-1">Multiplayer</h2>
                  <p className="text-slate-400 text-sm">Play with a friend online</p>
                </div>
              </div>
            </button>
          </div>
        </div>
      </main>
    );
  }

  // Render game content based on mode
  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 relative overflow-hidden">
      {/* Background decorations */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div 
          className="absolute inset-0 opacity-5"
          style={{
            backgroundImage: `
              linear-gradient(rgba(0,255,255,0.1) 1px, transparent 1px),
              linear-gradient(90deg, rgba(0,255,255,0.1) 1px, transparent 1px)
            `,
            backgroundSize: '50px 50px',
          }}
        />
        
        <div className="absolute top-1/4 -left-32 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 -right-32 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-pink-500/5 rounded-full blur-3xl" />
      </div>
      
      <div className="relative z-10 container mx-auto px-4 py-8">
        {/* Header */}
        <header className="flex flex-col md:flex-row items-center justify-between gap-6 mb-8">
          {/* Title */}
          <div className="text-center md:text-left">
            <h1 className="text-4xl md:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400 neon-text">
              Memory Match
            </h1>
            <p className="text-slate-400 mt-1">
              {gameMode === 'single' ? 'Single Player' : 'Multiplayer'}
            </p>
          </div>
          
          {/* Stats */}
          {gameMode === 'single' && gameStatus !== 'idle' && (
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-amber-500/20 to-amber-600/20 flex items-center justify-center border border-amber-500/50">
                  <Trophy className="w-6 h-6 text-amber-400" />
                </div>
                <div>
                  <div className="text-xs text-slate-400 uppercase tracking-wider">Moves</div>
                  <div className="text-2xl font-bold text-white">{moves}</div>
                </div>
              </div>
              
              <div className="flex gap-2">
                <button
                  onClick={handleBackToMenu}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg bg-slate-800/80 border border-slate-700 text-white hover:bg-slate-700/80 hover:border-slate-600 transition-all"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Menu
                </button>
                
                <button
                  onClick={handleRestart}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg bg-slate-800/80 border border-slate-700 text-white hover:bg-slate-700/80 hover:border-slate-600 transition-all"
                >
                  <RefreshCw className="w-4 h-4" />
                  Restart
                </button>
              </div>
            </div>
          )}
          
          {/* Multiplayer Header */}
          {gameMode === 'multi' && (
            <div className="flex items-center gap-4">
              <button
                onClick={handleBackToMenu}
                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-slate-800/80 border border-slate-700 text-white hover:bg-slate-700/80 hover:border-slate-600 transition-all"
              >
                <ArrowLeft className="w-4 h-4" />
                Menu
              </button>
            </div>
          )}
        </header>
        
        {/* Game Content */}
        {gameMode === 'single' ? (
          // Single Player
          gameStatus === 'idle' ? (
            <LevelSelection />
          ) : (
            <div className="flex justify-center mb-8">
              <MemoryGameBoard />
            </div>
          )
        ) : (
          // Multiplayer
          !isGameStarted ? (
            <RoomLobby />
          ) : (
            <div className="flex justify-center mb-8">
              <MultiplayerGameBoard />
            </div>
          )
        )}
      </div>
      
      {/* Win Modals */}
      {gameMode === 'single' && <MemoryWinModal />}
      {gameMode === 'multi' && <MultiplayerWinModal />}
    </main>
  );
}
