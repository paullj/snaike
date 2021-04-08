import { Connection } from './connection';
import { Node, NodeType } from './node';
import { uuid, generateInnovation, randomBetween, pickOne, randomEnum } from './utils';

import { Config, DefaultConfig } from './config';
import { isRecurrent } from './utils';
import { ActivationType } from './activation';

class Genome {
  id!: string;

  private _connections: Map<number, Connection> = new Map();
  private _nodes: Map<string, Node> = new Map();
  initialSize: number;

  public get connectionSize(): number {
    return this._connections.size;
  }

  public get inputCount(): number {
    return this.nodes.filter((n) => n.type === NodeType.Input).length;
  }

  public get outputCount(): number {
    return this.nodes.filter((n) => n.type === NodeType.Output).length;
  }

  public get nodeSize(): number {
    return this._nodes.size;
  }

  public get connections(): Connection[] {
    return Array.from(this._connections.values());
  }

  public get innovations(): number[] {
    return Array.from(this._connections.keys());
  }

  public get nodes(): Node[] {
    return Array.from(this._nodes.values());
  }

  constructor(initialNodes: Node[] = [], initialConnections: Connection[] = [], id: string = uuid()) {
    this.id = id;

    initialNodes.forEach((node) => this.addNode(node));
    initialConnections.forEach((connection) => this.addConnection(connection));
    this.initialSize = initialNodes?.length ?? 0 + initialConnections?.length ?? 0;
  }

  copy(): Genome {
    const genome: Genome = new (<any>this.constructor)();
    genome.initialSize = this.initialSize;

    this._connections.forEach((gene, key) => {
      genome._connections.set(key, gene.copy());
    });

    this._nodes.forEach((node, key) => {
      genome._nodes.set(key, node.copy());
    });

    return genome;
  }

  getConnectionAt(innovation: number): Connection | null {
    return this._connections.get(innovation) ?? null;
  }

  connectionExists(from: Node, to: Node): boolean {
    return this.connections.some(
      (connection) => connection.from.id === from.id && connection.to.id === to.id
    );
  }

  addConnection(connection: Connection): void {
    if (this.connectionExists(connection.from, connection.to)) return;

    connection.innovation = connection.innovation ?? generateInnovation();
    this._connections.set(connection.innovation, connection);
  }

  addNode(node: Node): void {
    if (!this._nodes.has(node.id)) this._nodes.set(node.id, node);
  }

  mutate(config: Config = DefaultConfig): void {
    const {
      mutateAddNodeProbability,
      mutateAddConnectionProbability,
      mutateConnectionWeightsProbability,
      mutateToggleEnableProbability,
      mutateSetEnableProbability,
      mutateActivationProbability
    } = {
      ...config
    };

    if (Math.random() < mutateAddNodeProbability!) {
      this.mutateAddNode();
    } else if (Math.random() < mutateAddConnectionProbability!) {
      this.mutateAddConnection(config);
    } else {
      if (Math.random() < mutateActivationProbability!) {
        this.mutateModifyActivation();
      }
      if (Math.random() < mutateConnectionWeightsProbability!) {
        this.mutateConnectionsWeights(config);
      }

      if (Math.random() < mutateToggleEnableProbability!) {
        this.mutateSetConnection();
      }

      if (Math.random() < mutateSetEnableProbability!) {
        this.mutateSetConnection(true);
      }
    }
  }

  mutateModifyActivation(node?: Node): void {
    const activation = randomEnum(ActivationType);

    if(node) {
      node.activationType = activation;
    } else {
      const hidden = this.nodes.filter(({ type }) => type === NodeType.Hidden);
      if(hidden?.length) {
        pickOne(hidden)!.activationType = activation;
      }
    }
  }

  mutateAddConnection(config: Config = DefaultConfig): void {
    const { connectionStrength, maxAddConnectionTries } = {
      ...config
    };

    let maxTries = maxAddConnectionTries!;

    while (maxTries--) {
      const from = pickOne(this.nodes.filter(({ type }) => type !== NodeType.Output))!;

      const to = pickOne(
        this.nodes.filter(
          ({ id, type }) =>
            // Don't make connections to inputs or bias
            !(type === NodeType.Input || type === NodeType.Bias) &&
            // Exclude connections to the same node
            id !== from.id &&
            // Exclude connections to the same node
            (from.type === NodeType.Output ? type !== NodeType.Output : true)
        )
      )!;

      const connection = new Connection(from, to, randomBetween(-connectionStrength!, connectionStrength!));
      const isValid =
        // connection already exists
        !this.connectionExists(from, to) &&
        // is a RNN
        !isRecurrent(connection, this.connections);

      if (isValid) {
        this.addConnection(connection);
        break;
      }
    }
  }

  mutateAddNode(): void {
    const possibleConnections = this.connections.filter(({ enabled }) => enabled);

    if (possibleConnections.length === 0) return;

    const connection = pickOne(possibleConnections)!;
    const node = new Node(NodeType.Hidden);

    connection.enabled = false;

    this.addConnection(new Connection(connection.from, node));
    this.addConnection(new Connection(node, connection.to, connection.weight));
    this.addNode(node);
  }

  mutateRemoveNode(): void {
    const hiddenNodes = this.nodes.filter(({ type }) => type === NodeType.Hidden);

    if (hiddenNodes?.length === 0) return;

    const node = pickOne(hiddenNodes)!;
    const from: Array<Node> = [];
    const to: Array<Node> = [];
    this.connections.forEach((connection) => {
      if (connection.from.id === node.id) to.push(connection.to);
      if (connection.to.id === node.id) from.push(connection.from);
    });
  }

  mutateSetConnection(value: boolean = Math.random() > 0.5): void {
    const connection = pickOne(this.connections.filter(({ enabled }) => enabled !== value));
    if (!connection) return;

    connection.enabled = value;
  }

  mutateConnectionsWeights(config: Config = DefaultConfig): void {
    const {
      connectionStrength,
      connectionPertubationProbability
    } = { ...config };

    this.connections
      .filter(({ enabled }) => enabled)
      .forEach((connection) => {
        const random = randomBetween(-connectionStrength!, connectionStrength!);
        const perturbed = Math.random() < connectionPertubationProbability!;
        connection.weight = perturbed ? connection.weight + random / 10 : random;
      });
  }
}

export { Genome };
