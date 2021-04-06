import type { Config } from './config';
import { NodeType } from './node';
import { Organism } from './organism';
import { isRecurrent } from './utils';

export const isSimilar = (a: Organism, b: Organism, config: Config): boolean => {
  //TODO: make config
  return distance(a, b, config) <= config.maxCompatibilityDistance;
};

export const distance = (a: Organism, b: Organism, config: Config): number => {
  const innovations: number[] = [...new Set([...a.innovations, ...b.innovations])];

  const n = Math.max(a.connectionSize, b.connectionSize, 1);

  let excess = Math.abs(a.connectionSize - b.connectionSize),
    disjoint = -excess,
    weight = 0;

  innovations.forEach((innovation) => {
    const geneA = a.getConnectionAt(innovation),
      geneB = b.getConnectionAt(innovation);

    if (geneA && geneB) {
      weight += Math.abs(geneA.weight - geneB.weight);
    } else if (!geneA || !geneB) {
      disjoint++;
    }
  });
  weight /= (n - disjoint) / config.weightDifferenceCoefficient;

  excess *= config.excessCoefficient;
  disjoint *= config.disjointCoefficient;

  return (excess + disjoint) / n + weight;
};

export const crossover = (a: Organism, b: Organism): Organism => {
  const [moreFit, lessFit] = [a, b].sort((a, b) => b.adjustedFitness - a.adjustedFitness);

  const initialNodes = Object.values(moreFit.nodes)
    .filter(({ type }) => type !== NodeType.Hidden)
    .map((node) => node.copy());

  const innovations: number[] = [...new Set([...moreFit.innovations, ...lessFit.innovations])];

  const child = new Organism(initialNodes);
  innovations
    .sort((a, b) => a - b)
    .forEach((innovation) => {
      const moreFitConnection = moreFit.getConnectionAt(innovation),
        lessFitConnection = lessFit.getConnectionAt(innovation);

      const connection =
        moreFitConnection && lessFitConnection
          ? Math.random() > 0.5
            ? moreFitConnection.copy()
            : lessFitConnection.copy()
          : (moreFitConnection || lessFitConnection).copy();

      if (isRecurrent(connection, child.connections)) {
        return;
      }
      connection.from = connection.from.copy();
      connection.to = connection.to.copy();

      child.addConnection(connection);

      child.addNode(connection.from);
      child.addNode(connection.to);
    });

  return child;
};
