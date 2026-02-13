'use client';

import React from 'react';
import { Card as CardType } from '@/types/memory';
import { CARD_VALUES } from '@/types/memory';

interface CardProps {
  card: CardType;
  onClick: () => void;
  disabled?: boolean;
}

export default function Card({ card, onClick, disabled = false }: CardProps) {
  const handleClick = () => {
    if (disabled) return;
    if (!card.isFlipped && !card.isMatched) {
      onClick();
    }
  };

  const baseClasses = "w-full aspect-square flex items-center justify-center cursor-pointer select-none rounded-lg transition-all duration-300";
  const backClasses = disabled 
    ? "bg-slate-700 cursor-not-allowed" 
    : "bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 hover:scale-105 shadow-lg";
  const frontClasses = "bg-white shadow-lg";
  const matchedClasses = "opacity-30";

  const getClasses = () => {
    if (card.isMatched) return `${baseClasses} ${matchedClasses}`;
    if (card.isFlipped) return `${baseClasses} ${frontClasses}`;
    return `${baseClasses} ${backClasses}`;
  };

  return (
    <div onClick={handleClick} className={getClasses()} style={{ minWidth: 0 }}>
      {card.isFlipped || card.isMatched ? (
        <span className="text-3xl sm:text-4xl">{CARD_VALUES[card.value]}</span>
      ) : (
        <span className="text-2xl sm:text-3xl">?</span>
      )}
    </div>
  );
}
