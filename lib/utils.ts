/**
 * Utility functions for Pikachu Classic game
 */

import { Difficulty, DifficultySettings, DIFFICULTY_SETTINGS, TILE_EMOJIS, Position } from '@/types/game';

/**
 * Format seconds to MM:SS string
 */
export function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

/**
 * Get emoji for tile value
 */
export function getTileEmoji(value: number): string {
  return TILE_EMOJIS[value] || '❓';
}

/**
 * Get difficulty settings
 */
export function getDifficultySettings(difficulty: Difficulty): DifficultySettings {
  return DIFFICULTY_SETTINGS[difficulty];
}

/**
 * Calculate score based on matches
 * Base: 10 points per match
 * Bonus: Could add combo multipliers
 */
export function calculateScore(matches: number, timeBonus: number = 0): number {
  return matches * 10 + timeBonus;
}

/**
 * Check if two positions are equal
 */
export function positionsEqual(a: Position, b: Position): boolean {
  return a.x === b.x && a.y === b.y;
}

/**
 * Get position key for Set/Map
 */
export function getPositionKey(pos: Position): string {
  return `${pos.x},${pos.y}`;
}

/**
 * Convert grid position to pixel position
 * Used for connection line drawing
 */
export function gridToPixel(
  pos: Position, 
  tileSize: number = 60, 
  gap: number = 4,
  padding: number = 16
): { x: number; y: number } {
  return {
    x: pos.x * (tileSize + gap) + padding + tileSize / 2,
    y: pos.y * (tileSize + gap) + padding + tileSize / 2,
  };
}

/**
 * Convert path to SVG path string
 */
export function pathToSvgPath(path: Position[], tileSize: number = 60, gap: number = 4, padding: number = 16): string {
  if (path.length === 0) return '';
  
  const points = path.map(pos => gridToPixel(pos, tileSize, gap, padding));
  
  let d = `M ${points[0].x} ${points[0].y}`;
  for (let i = 1; i < points.length; i++) {
    d += ` L ${points[i].x} ${points[i].y}`;
  }
  
  return d;
}

/**
 * Generate unique ID
 */
export function generateId(): string {
  return Math.random().toString(36).substring(2, 9);
}

/**
 * Delay utility for animations
 */
export function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Clamp a number between min and max
 */
export function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}
