import type { Node } from './node';
import type { Connection } from './connection';
import { NodeType } from './node';
import { ActivationType, getActivationFunction } from './activation';

interface Neuron {
  id: string;
  incoming: Array<Link>;
  outgoing: Array<Link>;
  activationType: ActivationType;
}

interface Link {
  weight: number;
  from: Neuron;
  to: Neuron;
}

type Values = Map<Neuron, number>;

export class Network {
  inputs: Array<Neuron> = [];
  biases: Array<Neuron> = [];
  outputs: Array<Neuron> = [];

  neurons: Map<string, Neuron> = new Map();

  // state: [Values, Values];
  values: Values = new Map();

  constructor(nodes: Node[], connections: Connection[]) {
    nodes.forEach(({ id, type, activationType }) => {
      const neuron: Neuron = {
        id,
        activationType,
        incoming: [],
        outgoing: []
      };
      this.neurons.set(id, neuron);

      switch (type) {
        case NodeType.Input:
          this.inputs.push(neuron);
          break;
        case NodeType.Bias:
          this.biases.push(neuron);
          break;
        case NodeType.Output:
          this.outputs.push(neuron);
          break;
      }
    });

    connections
      .filter(({ enabled }) => enabled)
      .forEach((connection) => {
        const from = this.neurons.get(connection.from.id);
        const to = this.neurons.get(connection.to.id);
        const link: Link = {
          from,
          to,
          weight: connection.weight
        };

        from.outgoing.push(link);
        to.incoming.push(link);
      });
  }

  activate(inputs: number[]): number[] {
    if (inputs.length !== this.inputs.length) {
      console.error(
        `Input data length mismatch! Expected: ${this.inputs.length}, Received: ${inputs.length}`
      );
    }

    //Clear values from last activation
    this.values.clear();

    this.inputs.forEach((id, i) => {
      this.values.set(id, inputs[i]);
    });

    this.biases.forEach((id) => {
      this.values.set(id, 1);
    });

    const done: Set<Neuron> = new Set();
    const stack: Array<Neuron> = [...this.inputs, ...this.biases];
    while (stack.length) {
      const neuron: Neuron = stack.shift();

      if (done.has(neuron)) continue;

      if (neuron.incoming.length) {
        const sum = neuron.incoming.reduce(
          (prev, link) => prev + (this.values.get(link.from) ?? 0) * link.weight,
          0
        );
        const activation = getActivationFunction(neuron.activationType);
        this.values.set(neuron, activation(sum));
      }
      done.add(neuron);
      stack.push(
        ...neuron.outgoing.filter((l) => stack.indexOf(l.to) === -1).map((link) => link.to)
      );
    }
    return this.outputs.map((id) => this.values.get(id) ?? 0);
  }
}
