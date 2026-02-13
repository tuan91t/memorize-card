'use client';

import React from 'react';
import { useMemoryStore } from '@/store/memoryStore';
import { LEVELS } from '@/types/memory';
import Card from './MemoryCard';

export default function GameBoard() {
  const cards = useMemoryStore((state) => state.cards);
  const level = useMemoryStore((state) => state.level);
  const flipCard = useMemoryStore((state) => state.flipCard);
  
  const cols = LEVELS[level].cols;
  
  return (
    <div className="w-full max-w-6xl mx-auto p-2">
      {/* Dynamic grid based on level */}
      <div 
        className="grid gap-2 mx-auto"
        style={{
          gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))`,
          maxWidth: cols <= 4 ? '300px' : cols <= 6 ? '500px' : '800px',
        }}
      >
        {cards.map((card) => (
          <Card 
            key={card.id} 
            card={card} 
            onClick={() => flipCard(card.id)} 
          />
        ))}
      </div>
    </div>
  );
}
