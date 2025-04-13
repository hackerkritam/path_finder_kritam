import React, { useState, useCallback, useEffect } from 'react';
import { MazeGrid } from './components/MazeGrid';
import { Controls } from './components/Controls';
import { Cell, MazeState, Algorithm, CellType } from './types/maze';
import { Compass } from 'lucide-react';

const GRID_ROWS = 25;
const GRID_COLS = 40;
const CELL_SIZE = 20;

function createEmptyGrid(): Cell[][] {
  return Array.from({ length: GRID_ROWS }, (_, row) =>
    Array.from({ length: GRID_COLS }, (_, col) => ({
      type: 'empty',
      row,
      col,
      distance: Infinity,
      parent: null
    }))
  );
}

function generateMaze(grid: Cell[][]): Cell[][] {
  const newGrid = grid.map(row => row.map(cell => ({ ...cell, type: 'wall' })));
  
  function carve(row: number, col: number) {
    newGrid[row][col].type = 'empty';
    
    const directions = [
      [0, 2], [2, 0], [0, -2], [-2, 0]
    ].sort(() => Math.random() - 0.5);

    for (const [dr, dc] of directions) {
      const newRow = row + dr;
      const newCol = col + dc;
      
      if (
        newRow > 0 && newRow < GRID_ROWS - 1 &&
        newCol > 0 && newCol < GRID_COLS - 1 &&
        newGrid[newRow][newCol].type === 'wall'
      ) {
        newGrid[row + dr/2][col + dc/2].type = 'empty';
        carve(newRow, newCol);
      }
    }
  }

  carve(1, 1);
  return newGrid;
}

async function findPath(
  grid: Cell[][],
  start: Cell,
  end: Cell,
  algorithm: Algorithm,
  onVisit: (cell: Cell) => void,
  speed: number
): Promise<Cell[]> {
  const visited = new Set<Cell>();
  const queue: Cell[] = [start];
  start.distance = 0;

  while (queue.length > 0) {
    let current: Cell;
    
    if (algorithm === 'dijkstra' || algorithm === 'bfs') {
      current = queue.shift()!;
    } else if (algorithm === 'astar') {
      queue.sort((a, b) => {
        const aScore = a.distance + Math.abs(a.row - end.row) + Math.abs(a.col - end.col);
        const bScore = b.distance + Math.abs(b.row - end.row) + Math.abs(b.col - end.col);
        return aScore - bScore;
      });
      current = queue.shift()!;
    } else { // dfs
      current = queue.pop()!;
    }

    if (current === end) break;
    if (visited.has(current)) continue;

    visited.add(current);
    onVisit(current);
    await new Promise(resolve => setTimeout(resolve, 100 / speed));

    const neighbors = [
      [-1, 0], [1, 0], [0, -1], [0, 1]
    ].map(([dr, dc]) => {
      const row = current.row + dr;
      const col = current.col + dc;
      return row >= 0 && row < GRID_ROWS && col >= 0 && col < GRID_COLS
        ? grid[row][col]
        : null;
    }).filter((cell): cell is Cell => 
      cell !== null && 
      cell.type !== 'wall' && 
      !visited.has(cell)
    );

    for (const neighbor of neighbors) {
      const newDistance = current.distance + 1;
      if (newDistance < neighbor.distance) {
        neighbor.distance = newDistance;
        neighbor.parent = current;
      }
      queue.push(neighbor);
    }
  }

  const path: Cell[] = [];
  let current = end;
  while (current.parent) {
    path.unshift(current);
    current = current.parent;
  }
  path.unshift(start);

  return path;
}

function App() {
  const [state, setState] = useState<MazeState>({
    grid: createEmptyGrid(),
    startCell: null,
    endCell: null,
    visitedCells: new Set(),
    pathCells: new Set(),
    isGenerating: false,
    isPathfinding: false,
    selectedAlgorithm: 'dijkstra',
    speed: 50
  });

  const handleCellClick = useCallback((row: number, col: number) => {
    if (state.isPathfinding || state.isGenerating) return;

    setState(prev => {
      const newGrid = prev.grid.map(r => r.map(c => ({ ...c })));
      const clickedCell = newGrid[row][col];

      if (!prev.startCell) {
        clickedCell.type = 'start';
        return { ...prev, grid: newGrid, startCell: clickedCell };
      }
      
      if (!prev.endCell && clickedCell !== prev.startCell) {
        clickedCell.type = 'end';
        return { ...prev, grid: newGrid, endCell: clickedCell };
      }

      if (clickedCell.type === 'wall') {
        clickedCell.type = 'empty';
      } else if (clickedCell.type === 'empty') {
        clickedCell.type = 'wall';
      }

      return { ...prev, grid: newGrid };
    });
  }, [state.isPathfinding, state.isGenerating]);

  const handleGenerate = useCallback(() => {
    setState(prev => ({
      ...prev,
      isGenerating: true,
      grid: generateMaze(prev.grid),
      startCell: null,
      endCell: null,
      visitedCells: new Set(),
      pathCells: new Set(),
      isGenerating: false
    }));
  }, []);

  const handleClear = useCallback(() => {
    setState(prev => ({
      ...prev,
      grid: createEmptyGrid(),
      startCell: null,
      endCell: null,
      visitedCells: new Set(),
      pathCells: new Set()
    }));
  }, []);

  const handleStart = useCallback(async () => {
    if (!state.startCell || !state.endCell || state.isPathfinding) return;

    setState(prev => ({ ...prev, isPathfinding: true }));

    const newGrid = state.grid.map(row => 
      row.map(cell => ({ ...cell, distance: Infinity, parent: null }))
    );

    const path = await findPath(
      newGrid,
      newGrid[state.startCell.row][state.startCell.col],
      newGrid[state.endCell.row][state.endCell.col],
      state.selectedAlgorithm,
      (cell) => {
        setState(prev => {
          const gridCopy = prev.grid.map(r => r.map(c => ({ ...c })));
          if (cell.type !== 'start' && cell.type !== 'end') {
            gridCopy[cell.row][cell.col].type = 'visited';
          }
          return { ...prev, grid: gridCopy };
        });
      },
      state.speed
    );

    // Visualize the pat
    for (const cell of path) {
      if (cell.type !== 'start' && cell.type !== 'end') {
        setState(prev => {
          const gridCopy = prev.grid.map(r => r.map(c => ({ ...c })));
          gridCopy[cell.row][cell.col].type = 'path';
          return { ...prev, grid: gridCopy };
        });
        await new Promise(resolve => setTimeout(resolve, 50));
      }
    }

    setState(prev => ({ ...prev, isPathfinding: false }));
  }, [state.startCell, state.endCell, state.selectedAlgorithm, state.speed, state.isPathfinding]);

  return (
    <div className="min-h-screen bg-gray-900 text-white p-4">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center gap-4 mb-6">
          <Compass className="w-8 h-8 text-blue-400" />
          <h1 className="text-2xl font-bold">Pathfinding Playground</h1>
        </div>

        <div className="space-y-4">
          <Controls
            onGenerate={handleGenerate}
            onClear={handleClear}
            onAlgorithmChange={(algorithm) => 
              setState(prev => ({ ...prev, selectedAlgorithm: algorithm }))
            }
            onSpeedChange={(speed) => 
              setState(prev => ({ ...prev, speed }))
            }
            onStart={handleStart}
            selectedAlgorithm={state.selectedAlgorithm}
            speed={state.speed}
            isPathfinding={state.isPathfinding}
            isGenerating={state.isGenerating}
          />

          <div className="bg-gray-800 p-4 rounded-lg">
            <MazeGrid
              grid={state.grid}
              cellSize={CELL_SIZE}
              onCellClick={handleCellClick}
            />
            
            <div className="mt-4 text-sm text-gray-400 space-y-2">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-green-600 rounded"></div>
                  <span>Start</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-red-600 rounded"></div>
                  <span>End</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-gray-600 rounded"></div>
                  <span>Wall</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-indigo-600 rounded"></div>
                  <span>Visited</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-blue-600 rounded"></div>
                  <span>Path</span>
                </div>
              </div>
              <p>Click to place start and end points, then click empty cells to create/remove walls.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;