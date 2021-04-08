interface Config {
  populationSize?: number;
  connectionStrength?: number;
  connectionPertubationProbability?: number;
  maxAddConnectionTries?: number;
  modifyActivationTries?: number;
  mutateOnlyProbability?: number;
  mutateAddNodeProbability?: number;
  mutateAddConnectionProbability?: number;
  mutateConnectionWeightsProbability?: number;
  mutateToggleEnableProbability?: number;
  mutateActivationProbability?: number;
  mutateSetEnableProbability?: number;
  excessCoefficient?: number;
  disjointCoefficient?: number;
  weightDifferenceCoefficient?: number;
  maxCompatibilityDistance?: number;
  compatibilityModifier?: number;
  compatibilityModifierTarget?: number;
}

const DefaultConfig: Config = {
  populationSize: 1000,

  connectionStrength: 2.5,
  connectionPertubationProbability: 0.85,
  maxAddConnectionTries: 10,

  mutateOnlyProbability: 0.2,
  mutateAddNodeProbability: 0.03,
  mutateAddConnectionProbability: 0.04,
  mutateToggleEnableProbability: 0.01,
  mutateSetEnableProbability: 0.001,
  mutateActivationProbability: 0.02,
  mutateConnectionWeightsProbability: 0.9,

  excessCoefficient: 1.0,
  disjointCoefficient: 1.0,
  weightDifferenceCoefficient: 1,
  maxCompatibilityDistance: 3.0,

  compatibilityModifier: 0.3,
  compatibilityModifierTarget: 10
};

export type { Config };
export { DefaultConfig };
