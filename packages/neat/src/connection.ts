import type { Node } from './node';

class Connection {
  to: Node;
  from: Node;
  innovation?: number;

  weight: number;
  enabled: boolean;

  constructor(from: Node, to: Node, weight = 1, enabled = true) {
    this.from = from;
    this.to = to;
    this.weight = weight;
    this.enabled = enabled;
  }

  copy(): Connection {
    const c = new Connection(this.from, this.to, this.weight, this.enabled);
    c.innovation = this.innovation;
    return c;
  }
}

export { Connection }