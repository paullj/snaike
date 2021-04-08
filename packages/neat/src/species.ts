import { Config, DefaultConfig } from './config';
import { crossover, distance } from './crossover';
import type { Organism } from './organism';
import { pickOne, uuid } from './utils';

class Species {
  id: string;
  organisms: Array<Organism> = [];
  representative: Organism | null = null;
  best: Organism | null = null;
  averageFitness = 0;
  extinct = false;

  age = 0;
  stagnant = 0;

  constructor(ancestor?: Organism, id = uuid()) {
    this.id = id;
    if (ancestor) {
      this.addOrganism(ancestor);
      this.representative = this.best = ancestor;
    }
  }

  addOrganism = (organism: Organism): void => {
    if (!this.representative) this.representative = organism;

    this.organisms.push(organism);
    organism.species = this;
  };

  removeOrganism = (organism: Organism): void => {
    const index = this.organisms.indexOf(organism);
    if (~index) this.organisms.splice(index, 1);
  };

  adjustFitness = (): void => {
    this.stagnant++;

    this.extinct = this.stagnant >= 15;

    this.organisms.forEach((organism) => {
      organism.adjustedFitness = organism.fitness;
      this.averageFitness += organism.fitness;

      if (this.extinct) {
        // Penalty for a long period of stagnation (divide fitness by 100)
        organism.adjustedFitness *= 0.01;
      }

      if (this.age <= 10) {
        // boost young organisms
        organism.adjustedFitness *= 1;
      }
      organism.adjustedFitness -=
        0.01 * (organism.nodeSize + organism.connectionSize - organism.initialSize);
    });

    this.organisms.sort((a, b) => b.adjustedFitness - a.adjustedFitness);
    this.representative = pickOne(this.organisms) ?? null;

    this.averageFitness /= this.organisms.length;
    if (!this.best || this.organisms[0].fitness > this.best.fitness) {
      this.best = this.organisms[0];
      this.stagnant = 0;
    }
    // console.log(`${this.id.slice(0, 5)}. Best: ${this.best.fitness}, Average: ${this.averageFitness}`);
  };

  cull(cullingProportion: number): void {
    if (cullingProportion > 0) {
      const removeFrom = Math.floor(-this.organisms.length * cullingProportion);
      this.organisms.splice(removeFrom);
    }
  }

  reproduce(expectedOffspring: number, generation: number, config: Config = DefaultConfig): Array<Organism> {
    const descendants: Organism[] = [];
    if (expectedOffspring && !this.organisms.length) {
      return descendants;
    }
    descendants.push(...this.organisms.slice(0, 5));

    const [...ancestors] = this.organisms;

    for (let i = 0; i < expectedOffspring; i++) {
      if (i < 5 && expectedOffspring > 5) {
        descendants.push(this.best!.copy());
      } else if (Math.random() < config.mutateOnlyProbability!) {
        const parent = pickOne(ancestors)!;
        const child = parent.copy();
        child.mutate(config);
        descendants.push(child);
      } else {
        const mother = pickOne(ancestors)!;
        const father = pickOne(ancestors)!;

        const child = crossover(mother, father);
        if (Math.random() < config.mutateOnlyProbability! || distance(mother, father, config) === 0)
          child.mutate(config);

        child.generation = generation;
        child.species = mother.species;
        descendants.push(child);
      }
    }
    return descendants;
  }
}

export { Species };