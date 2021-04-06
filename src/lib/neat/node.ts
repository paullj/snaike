import { ActivationType } from './activation';
import { uuid } from './utils';

export enum NodeType {
  Bias = 0,
  Input = 1,
  Hidden = 2,
  Output = 3
}

export class Node {
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
