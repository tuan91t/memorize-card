'use client';

import React from 'react';
import { useGameStore } from '@/store/useGameStore';
import { formatTime } from '@/lib/utils';
import { Clock } from 'lucide-react';

export default function Timer() {
  const timeRemaining = useGameStore((state) => state.timeRemaining);
  const settings = useGameStore((state) => state.settings);
  const gameStatus = useGameStore((state) => state.gameStatus);
  
  const isWarning = timeRemaining <= 30;
  const isCritical = timeRemaining <= 10;
  
  const getColor = () => {
    if (isCritical) return 'text-red-500';
    if (isWarning) return 'text-amber-400';
    return 'text-cyan-400';
  };
  
  return (
    <div className="flex items-center gap-3">
      <div className={`
        w-12 h-12 rounded-lg flex items-center justify-center
        bg-gradient-to-br from-slate-800 to-slate-900
        border ${isCritical ? 'border-red-500 animate-pulse' : isWarning ? 'border-amber-500' : 'border-cyan-500/50'}
      `}>
        <Clock className={`w-6 h-6 ${getColor()}`} />
      </div>
      
      <div>
        <div className="text-xs text-slate-400 uppercase tracking-wider">Time</div>
        <div 
          className={`
            text-3xl font-bold tabular-nums
            ${getColor()}
            ${isCritical ? 'animate-pulse' : ''}
          `}
          style={{
            textShadow: isCritical 
              ? '0 0 20px rgba(239, 68, 68, 0.8)' 
              : isWarning 
                ? '0 0 15px rgba(251, 191, 36, 0.5)' 
                : '0 0 10px rgba(0, 255, 255, 0.3)',
          }}
        >
          {formatTime(timeRemaining)}
        </div>
      </div>
      
      {/* Progress bar */}
      <div className="w-24 h-2 bg-slate-800 rounded-full overflow-hidden">
        <div 
          className={`
            h-full transition-all duration-1000 ease-linear
            ${isCritical ? 'bg-red-500' : isWarning ? 'bg-amber-500' : 'bg-cyan-500'}
          `}
          style={{ 
            width: `${(timeRemaining / settings.timeLimit) * 100}%`,
            boxShadow: isCritical 
              ? '0 0 10px #ef4444' 
              : isWarning 
                ? '0 0 10px #f59e0b' 
                : '0 0 10px #06b6d4'
          }}
        />
      </div>
    </div>
  );
}
