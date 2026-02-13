'use client';

import React, { useEffect, useState, useRef } from 'react';
import { useGameStore } from '@/store/useGameStore';
import { Trophy } from 'lucide-react';

export default function ScoreBoard() {
  const score = useGameStore((state) => state.score);
  const matches = useGameStore((state) => state.matches);
  
  const [isAnimating, setIsAnimating] = useState(false);
  const [displayScore, setDisplayScore] = useState(score);
  const displayScoreRef = useRef(score);
  displayScoreRef.current = displayScore;
  
  // Animate score changes
  useEffect(() => {
    // eslint-disable-next-line react-hooks/exhaustive-deps
    if (score !== displayScore) {
      setIsAnimating(true);
      
      // Quick counting animation
      const diff = score - displayScoreRef.current;
      const steps = 10;
      const increment = diff / steps;
      let current = displayScoreRef.current;
      let step = 0;
      
      const interval = setInterval(() => {
        step++;
        current += increment;
        setDisplayScore(Math.round(current));
        
        if (step >= steps) {
          clearInterval(interval);
          setDisplayScore(score);
          setTimeout(() => setIsAnimating(false), 200);
        }
      }, 30);
      
      return () => clearInterval(interval);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [score]);
  
  return (
    <div className="flex items-center gap-6">
      {/* Score */}
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-amber-500/20 to-amber-600/20 flex items-center justify-center border border-amber-500/50">
          <Trophy className="w-6 h-6 text-amber-400" />
        </div>
        <div>
          <div className="text-xs text-slate-400 uppercase tracking-wider">Score</div>
          <div 
            className={`
              text-3xl font-bold text-white neon-text
              ${isAnimating ? 'scale-110 text-cyan-400' : ''}
            `}
            style={{ 
              textShadow: isAnimating ? '0 0 20px #00ffff' : '0 0 10px rgba(255,255,255,0.5)',
              transition: 'all 0.2s ease-out'
            }}
          >
            {displayScore}
          </div>
        </div>
      </div>
      
      {/* Matches */}
      <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-slate-800/50 border border-slate-700">
        <div className="text-sm text-slate-400">Matches:</div>
        <div className="text-xl font-bold text-white">{matches}</div>
      </div>
    </div>
  );
}
