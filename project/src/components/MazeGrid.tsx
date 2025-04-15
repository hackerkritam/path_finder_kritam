import React, { useRef, useEffect } from 'react';
import { Cell, CellType } from '../types/maze';

interface MazeGridProps {
  grid: Cell[][];
  cellSize: number;
  onCellClick: (row: number, col: number) => void;
}

const CELL_COLORS: Record<CellType, string> = {
  empty: '#1f2937',
  wall: '#4b5563',
  start: '#059669',
  end: '#dc2626',
  path: '#3b82f6',
  visited: '#6366f1'
};

export function MazeGrid({ grid, cellSize, onCellClick }: MazeGridProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = grid[0].length * cellSize;
    const height = grid.length * cellSize;

    // Clear canvas
    ctx.clearRect(0, 0, width, height);

    // Draw cells
    grid.forEach((row, i) => {
      row.forEach((cell, j) => {
        ctx.fillStyle = CELL_COLORS[cell.type];
        ctx.fillRect(j * cellSize, i * cellSize, cellSize, cellSize);
        
        // Draw cell border
        ctx.strokeStyle = '#374151';
        ctx.strokeRect(j * cellSize, i * cellSize, cellSize, cellSize);

        // Draw distance for visited cells
        if (cell.type === 'visited' && cell.distance !== Infinity) {
          ctx.fillStyle = '#ffffff';
          ctx.font = '10px Arial';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText(
            cell.distance.toString(),
            j * cellSize + cellSize / 2,
            i * cellSize + cellSize / 2
          );
        }
      });
    });
  }, [grid, cellSize]);


 

  return (
    <canvas
      ref={canvasRef}
      width={grid[0].length * cellSize}
      height={grid.length * cellSize}
      onClick={handleCanvasClick}
      className="bg-gray-900 rounded-lg shadow-lg cursor-pointer"
    />
  );
}