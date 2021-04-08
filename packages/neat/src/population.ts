import { DefaultConfig } from './config';
import type { Config } from './config';
import type { Connection } from './connection';
import type { Node } from './node';
import { isSimilar } from './crossover';
import { Organism } from './organism';
import { Species } from './species';

type FitnessFunction = (organism: Organism) => number;

class Population {
  config: Config;
  initialNodes: Array<Node> = [];
  initialConnections: Array<Connection> = [];
  organisms: Array<Organism> = [];
  species: Array<Species> = [];
  best: Organism | null = null;
  generation = 0;

  constructor(
    initialNodes: Array<Node>,
    initialConnections: Array<Connection>,

    config: Config = DefaultConfig
  ) {
    this.config = { ...DefaultConfig, ...config };
    this.initialNodes = initialNodes;
    this.initialConnections = initialConnections;

    const ancestor = new Organism(this.initialNodes, this.initialConnections);

    for (let i = 0; i < config.populationSize!; i++) {
      const organism = ancestor.copy();
      organism.mutate(this.config);
      this.addOrganism(organism);
    }
    this.speciate(this.organisms);
  }

  removeOrganism(organism: Organism): void {
    const index = this.organisms.indexOf(organism);
    if (~index) this.organisms.splice(index, 1);
  }

  addOrganism(organism = new Organism(this.initialNodes, this.initialConnections)): void {
    this.organisms.push(organism);
  }

  run(fitnessThreshold: number, fitnessFn: FitnessFunction, maxIterations = Infinity): Organism {
    // console.log(`Population of ${this.organisms.length} has ${this.species.length} species`);
    while (!Number.isFinite(maxIterations) || maxIterations--) {
      for (let i = 0; i < this.organisms.length; i++) {
        const organism = this.organisms[i];
        organism.fitness = fitnessFn(organism);

        if (organism.fitness >= fitnessThreshold) {
          // console.log('Converged!');
          return organism;
        }
      }
      this.epoch();
      // console.log(
      //   `Generation ${this.generation}. Best: ${this.best?.fitness.toFixed(2) ?? 'n/a'}, Population: ${
      //     this.organisms.length
      //   }/${this.config.populationSize}, Species: ${this.species.length}`
      // );
    }

    return this.organisms.sort((a, b) => b.adjustedFitness - a.adjustedFitness)[0];
  }

  epoch = (): void => {
    this.generation++;

    // Adjust compatibility threshold
    // if (this.species.length !== this.config.compatibilityModifierTarget) {
    //   this.config.maxCompatibilityDistance -=
    //     this.config.compatibilityModifier *
    //     Math.sign(this.config.compatibilityModifierTarget - this.species.length);

    //   this.config.maxCompatibilityDistance = Math.max(
    //     this.config.maxCompatibilityDistance,
    //     this.config.compatibilityModifier
    //   );
    // }

    //Adjust fitness within each species
    let speciesFitnessSum = 0;
    this.species.forEach((species) => {
      species.adjustFitness();
      species.cull(0.8);
      speciesFitnessSum += species.averageFitness;
    });
    // Sort species by their best organisms
    this.species.sort((a, b) => b.best!.adjustedFitness - a.best!.adjustedFitness);
    this.best = this.species[0].best;
    // Remove all organisms from the old generation
    this.organisms.splice(0);
    // Reproduce all species
    this.species.forEach((species) => {
      const expectedOffspring = Math.round(
        (species.averageFitness / speciesFitnessSum) * this.config.populationSize!
      );
      // Add new offspring to the population
      this.organisms.push(...species.reproduce(expectedOffspring, this.generation, this.config));
      // Remove all the old organism from the species
      species.cull(1);
    });
    this.speciate(this.organisms);

    // Remove species with no more organisms in them
    this.species = this.species.filter((species) => {
      species.age++;
      return species.organisms.length;
    });
  };

  speciate(organisms: Array<Organism>): void {
    if (!organisms) return;
    this.organisms.forEach((organism) => {
      let species = this.species.length
        ? [organism.species, ...this.species]
            .filter((s) => s != null)
            .find((s) => isSimilar(organism, s!.representative!, this.config))
        : null;
      if (!species) {
        species = new Species();
        this.species.push(species);
      }
      species.addOrganism(organism);
    });
  }
}

export { Population };
export type { FitnessFunction };