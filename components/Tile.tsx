'use client';

import React from 'react';
import { Position } from '@/types/game';
import { getTileEmoji } from '@/lib/utils';

interface TileProps {
  value: number;
  position: Position;
  isSelected: boolean;
  isMatched: boolean;
  isShaking: boolean;
  onClick: () => void;
}

export default function Tile({
  value,
  position,
  isSelected,
  isMatched,
  isShaking,
  onClick,
}: TileProps) {
  const emoji = getTileEmoji(value);
  
  const baseClasses = `
    w-[60px] h-[60px] rounded-lg flex items-center justify-center 
    text-3xl cursor-pointer transition-all duration-200 ease-out 
    select-none backdrop-blur-sm
  `;
  
  const backgroundClasses = isSelected
    ? 'bg-gradient-to-br from-cyan-500/20 to-cyan-600/20'
    : 'bg-gradient-to-br from-slate-800 to-slate-900';
  
  const borderClasses = isSelected
    ? 'border-cyan-400 ring-4 ring-cyan-400/50'
    : 'border-slate-600 hover:border-cyan-400';
  
  const shadowClasses = isSelected
    ? 'shadow-[0_0_20px_rgba(0,255,255,0.5),0_0_40px_rgba(0,255,255,0.3)]'
    : 'shadow-lg hover:shadow-cyan-400/30';
  
  const scaleClasses = isMatched
    ? 'scale-75 opacity-0 pointer-events-none'
    : 'hover:scale-105';
  
  const shakeClasses = isShaking ? 'animate-shake' : '';
  
  const combinedClasses = `
    ${baseClasses}
    ${backgroundClasses}
    ${borderClasses}
    ${shadowClasses}
    ${scaleClasses}
    ${shakeClasses}
  `.trim().replace(/\s+/g, ' ');
  
  return (
    <button
      className={combinedClasses}
      onClick={onClick}
      disabled={isMatched}
      aria-label={`Tile ${emoji} at position ${position.x}, ${position.y}`}
      type="button"
    >
      <span className={isSelected ? 'animate-pulse' : ''}>
        {emoji}
      </span>
    </button>
  );
}
