import type { Node } from './node';

export class Connection {
  to: Node;
  from: Node;
  innovation?: number;

  weight: number;
  enabled: boolean;

  constructor(from: Node, to: Node, weight = 1, enabled = true, innovation: number = null) {
    this.from = from;
    this.to = to;
    this.weight = weight;
    this.enabled = enabled;
    this.innovation = innovation;
  }

  copy(): Connection {
    return new Connection(this.from, this.to, this.weight, this.enabled, this.innovation);
  }
}
