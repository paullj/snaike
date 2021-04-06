import { Genome } from './genome';

import { Network } from './network';
import type { Node } from './node';
import type { Connection } from './connection';
import { uuid } from './utils';
import type { Species } from './species';

class Organism extends Genome {
  private network?: Network;
  adjustedFitness = 0;
  fitness = 0;
  species?: Species;
  generation = 0;

  constructor(initialNodes?: Node[], initialConnections?: Connection[], id = uuid()) {
    super(initialNodes, initialConnections, id);
  }

  generateNetwork = (): void => {
    this.network = new Network(this.nodes, this.connections);
  };

  activate = (inputs: number[]): number[] => {
    if (!this.network) this.generateNetwork();

    return this.network.activate(inputs);
  };

  copy = (): Organism => {
    const clone = super.copy() as Organism;
    return clone;
  };
}

export { Organism };
