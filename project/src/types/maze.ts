export type CellType = 'empty' | 'wall' | 'start' | 'end' | 'path' | 'visited';

export interface Cell {
  type: CellType;
  row: number;
  col: number;
  distance: number;
  parent: Cell | null;
}

export type Algorithm = 'dijkstra' | 'astar' | 'dfs' | 'bfs';

export interface MazeState {
  grid: Cell[][];
  startCell: Cell | null;
  endCell: Cell | null;
  visitedCells: Set<Cell>;
  pathCells: Set<Cell>;
  isGenerating: boolean;
  isPathfinding: boolean;
  selectedAlgorithm: Algorithm;
  speed: number;
}