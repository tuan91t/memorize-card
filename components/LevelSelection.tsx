'use client';

import React from 'react';
import { useMemoryStore } from '@/store/memoryStore';
import { Level, LEVELS } from '@/types/memory';
import { Play, Grid3X3, Zap, Skull } from 'lucide-react';

const levelIcons = {
  easy: Grid3X3,
  medium: Zap,
  hard: Skull,
};

const levelColors = {
  easy: 'from-green-500/20 to-emerald-600/20 border-green-500/50 hover:border-green-400',
  medium: 'from-amber-500/20 to-orange-600/20 border-amber-500/50 hover:border-amber-400',
  hard: 'from-red-500/20 to-rose-600/20 border-red-500/50 hover:border-red-400',
};

export default function LevelSelection() {
  const setLevel = useMemoryStore((state) => state.setLevel);
  const gameStatus = useMemoryStore((state) => state.gameStatus);

  const handleLevelSelect = (level: Level) => {
    setLevel(level);
  };

  if (gameStatus !== 'idle') {
    return null;
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh]">
      <h2 className="text-3xl font-bold text-white mb-2">Select Difficulty</h2>
      <p className="text-slate-400 mb-8">Choose your challenge level</p>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 w-full max-w-2xl px-4">
        {(Object.keys(LEVELS) as Level[]).map((level) => {
          const config = LEVELS[level];
          const Icon = levelIcons[level];
          const colorClass = levelColors[level];
          
          return (
            <button
              key={level}
              onClick={() => handleLevelSelect(level)}
              className={`
                group relative p-6 rounded-xl border-2 bg-gradient-to-br transition-all duration-300
                hover:scale-105 hover:shadow-lg hover:shadow-cyan-500/20
                ${colorClass}
              `}
            >
              <div className="flex flex-col items-center gap-3">
                <div className="w-14 h-14 rounded-full bg-white/10 flex items-center justify-center group-hover:bg-white/20 transition-colors">
                  <Icon className="w-7 h-7 text-white" />
                </div>
                
                <div className="text-center">
                  <h3 className="text-xl font-bold text-white mb-1">{config.name}</h3>
                  <p className="text-sm text-slate-300">{config.description}</p>
                </div>
                
                <div className="mt-2 flex items-center gap-1 text-sm text-cyan-400 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Play className="w-4 h-4" />
                  <span>Play</span>
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
