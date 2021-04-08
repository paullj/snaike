import { ActivationType } from './activation';
import { uuid } from './utils';

enum NodeType {
  Bias,
  Input,
  Hidden,
  Output
}

type NodeTypeName = keyof typeof NodeType;

class Node {
  id: string;
  type: NodeType;
  activationType: ActivationType = ActivationType.SIGMOID;

  constructor(type: NodeType, id: string = uuid()) {
    this.id = id;
    this.type = type;
  }

  copy(): Node {
    return new Node(this.type, this.id);
  }
}

export type { NodeTypeName };
export { Node, NodeType };