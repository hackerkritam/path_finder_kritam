import React, { useRef, useEffect } from 'react';
import { NetworkState } from '../types/network';

interface NetworkCanvasProps {
  network: NetworkState;
  width: number;
  height: number;
}

export function NetworkCanvas({ network, width, height }: NetworkCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear canvas
    ctx.clearRect(0, 0, width, height);

    // Draw connections
    network.connections.forEach(connection => {
      const fromNeuron = network.neurons.find(n => n.id === connection.from);
      const toNeuron = network.neurons.find(n => n.id === connection.to);
      
      if (!fromNeuron || !toNeuron) return;

      ctx.beginPath();
      ctx.moveTo(fromNeuron.x, fromNeuron.y);
      ctx.lineTo(toNeuron.x, toNeuron.y);
      
      // Weight determines line color and thickness
      const normalizedWeight = Math.tanh(connection.weight);
      const weightColor = normalizedWeight > 0 ? 
        `rgba(0, 128, 255, ${Math.abs(normalizedWeight)})` :
        `rgba(255, 128, 0, ${Math.abs(normalizedWeight)})`;
      
      ctx.strokeStyle = weightColor;
      ctx.lineWidth = Math.abs(normalizedWeight) * 3;
      ctx.stroke();
    });

    // Draw neurons
    network.neurons.forEach(neuron => {
      ctx.beginPath();
      ctx.arc(neuron.x, neuron.y, 15, 0, Math.PI * 2);
      
      // Activation determines fill color
      const activation = Math.tanh(neuron.activation);
      ctx.fillStyle = `rgba(255, 255, 255, ${0.3 + activation * 0.7})`;
      ctx.fill();
      
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 2;
      ctx.stroke();
    });
  }, [network, width, height]);

  return (
    <canvas
      ref={canvasRef}
      width={width}
      height={height}
      className="bg-gray-900 rounded-lg w-full"
    />
  );
}