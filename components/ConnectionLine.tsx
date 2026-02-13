'use client';

import React, { useRef, useEffect, useState } from 'react';
import { Position } from '@/types/game';

interface ConnectionLineProps {
  path: Position[];
  width: number;
  height: number;
  tileSize: number;
  gap: number;
  padding: number;
}

export default function ConnectionLine({
  path,
  width,
  height,
  tileSize,
  gap,
  padding,
}: ConnectionLineProps) {
  const pathRef = useRef<SVGPathElement>(null);
  const [pathLength, setPathLength] = useState(0);
  
  // Convert grid position to pixel position
  const gridToPixel = (pos: Position): { x: number; y: number } => ({
    x: pos.x * (tileSize + gap) + padding + tileSize / 2,
    y: pos.y * (tileSize + gap) + padding + tileSize / 2,
  });
  
  // Generate SVG path string
  const generatePathString = (): string => {
    if (!path || path.length === 0) return '';
    
    const points = path.map(gridToPixel);
    let d = `M ${points[0].x} ${points[0].y}`;
    
    for (let i = 1; i < points.length; i++) {
      d += ` L ${points[i].x} ${points[i].y}`;
    }
    
    return d;
  };
  
  // Animate the path drawing
  useEffect(() => {
    if (pathRef.current) {
      const length = pathRef.current.getTotalLength();
      setPathLength(length);
      
      // Reset and animate
      pathRef.current.style.strokeDasharray = `${length}`;
      pathRef.current.style.strokeDashoffset = `${length}`;
      
      // Trigger animation
      requestAnimationFrame(() => {
        if (pathRef.current) {
          pathRef.current.style.transition = 'stroke-dashoffset 0.35s ease-out';
          pathRef.current.style.strokeDashoffset = '0';
        }
      });
    }
  }, [path]);
  
  return (
    <svg
      className="absolute inset-0 pointer-events-none z-10"
      width={width}
      height={height}
      style={{ overflow: 'visible' }}
    >
      <defs>
        {/* Glow filter */}
        <filter id="neon-glow" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="3" result="coloredBlur" />
          <feMerge>
            <feMergeNode in="coloredBlur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>
      
      <path
        ref={pathRef}
        d={generatePathString()}
        className="connection-line"
        style={{
          stroke: '#00ffff',
          strokeWidth: 4,
          strokeLinecap: 'round',
          strokeLinejoin: 'round',
          fill: 'none',
          filter: 'url(#neon-glow)',
        }}
      />
    </svg>
  );
}
