export interface Neuron {
  id: string;
  layer: number;
  activation: number;
  x: number;
  y: number;
}

export interface Connection {
  from: string;
  to: string;
  weight: number;
}

export interface NetworkState {
  neurons: Neuron[];
  connections: Connection[];
  learningRate: number;
  epoch: number;
}