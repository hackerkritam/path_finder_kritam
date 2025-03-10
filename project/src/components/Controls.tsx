import React from 'react';
import { Play, Pause, RotateCcw, Zap, Brain } from 'lucide-react';
import { Algorithm } from '../types/maze';

interface ControlsProps {
  onGenerate: () => void;
  onClear: () => void;
  onAlgorithmChange: (algorithm: Algorithm) => void;
  onSpeedChange: (speed: number) => void;
  onStart: () => void;
  selectedAlgorithm: Algorithm;
  speed: number;
  isPathfinding: boolean;
  isGenerating: boolean;
}

export function Controls({
  onGenerate,
  onClear,
  onAlgorithmChange,
  onSpeedChange,
  onStart,
  selectedAlgorithm,
  speed,
  isPathfinding,
  isGenerating
}: ControlsProps) {
  return (
    <div className="flex flex-wrap gap-4 bg-gray-800 p-4 rounded-lg">
      <div className="flex items-center gap-2">
        <Brain className="w-5 h-5 text-blue-400" />
        <select
          value={selectedAlgorithm}
          onChange={(e) => onAlgorithmChange(e.target.value as Algorithm)}
          className="bg-gray-700 text-white rounded px-3 py-1 border border-gray-600"
        >
          <option value="dijkstra">Dijkstra's Algorithm</option>
          <option value="astar">A* Search</option>
          <option value="bfs">Breadth First Search</option>
          <option value="dfs">Depth First Search</option>
        </select>
      </div>

      <div className="flex items-center gap-2">
        <Zap className="w-5 h-5 text-yellow-400" />
        <input
          type="range"
          min="1"
          max="100"
          value={speed}
          onChange={(e) => onSpeedChange(parseInt(e.target.value))}
          className="w-32"
        />
        <span className="text-white text-sm">{speed}x</span>
      </div>

      <button
        onClick={onGenerate}
        disabled={isPathfinding || isGenerating}
        className="flex items-center gap-2 px-4 py-1 bg-green-600 hover:bg-green-700 disabled:bg-gray-600 rounded text-white"
      >
        <RotateCcw className="w-4 h-4" />
        Generate Maze
      </button>

      <button
        onClick={onStart}
        disabled={isPathfinding || isGenerating}
        className="flex items-center gap-2 px-4 py-1 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 rounded text-white"
      >
        {isPathfinding ? (
          <Pause className="w-4 h-4" />
        ) : (
          <Play className="w-4 h-4" />
        )}
        {isPathfinding ? 'Stop' : 'Start'}
      </button>

      <button
        onClick={onClear}
        disabled={isPathfinding || isGenerating}
        className="flex items-center gap-2 px-4 py-1 bg-red-600 hover:bg-red-700 disabled:bg-gray-600 rounded text-white"
      >
        Clear
      </button>
    </div>
  );
}