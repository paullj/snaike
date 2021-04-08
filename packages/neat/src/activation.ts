type ActivationFunction = (x: number) => number;

// Taken from here: https://github.com/wagenaartje/neataptic/blob/master/src/methods/activation.js
// https://en.wikipedia.org/wiki/Activation_function
// https://stats.stackexchange.com/questions/115258/comprehensive-list-of-activation-functions-in-neural-networks-with-pros-cons
enum ActivationType {
  LOGISTIC,
  TANH,
  IDENTITY,
  STEP,
  RELU,
  SOFTSIGN,
  SINUSOID,
  GAUSSIAN,
  BENT_IDENTITY,
  BIPOLAR,
  BIPOLAR_SIGMOID,
  HARD_TANH,
  ABSOLUTE,
  INVERSE,
  SELU,
  SIGMOID
}

type ActivationTypeName = keyof typeof ActivationType;

const getActivationFunction = (type: ActivationType): ActivationFunction => {
  switch (type) {
    case ActivationType.LOGISTIC:
      return (x) => {
        const fx = 1 / (1 + Math.exp(-x));
        return fx * (1 - fx);
      };
    case ActivationType.TANH:
      return (x) => Math.tanh(x);
    case ActivationType.IDENTITY:
      return (x) => x;
    case ActivationType.STEP:
      return (x) => (x > 0 ? 1 : 0);
    case ActivationType.RELU:
      return (x) => (x > 0 ? x : 0);
    case ActivationType.SOFTSIGN:
      return (x) => x / (1 + Math.abs(x));
    case ActivationType.SINUSOID:
      return (x) => Math.sin(x);
    case ActivationType.GAUSSIAN:
      return (x) => Math.exp(-Math.pow(x, 2));
    case ActivationType.BENT_IDENTITY:
      return (x) => (Math.sqrt(Math.pow(x, 2) + 1) - 1) / 2 + x;
    case ActivationType.BIPOLAR:
      return (x) => (x > 0 ? 1 : -1);
    case ActivationType.BIPOLAR_SIGMOID:
      return (x) => 2 / (1 + Math.exp(-x)) - 1;
    case ActivationType.HARD_TANH:
      return (x) => Math.max(-1, Math.min(1, x));
    case ActivationType.ABSOLUTE:
      return (x) => Math.abs(x);
    case ActivationType.INVERSE:
      return (x) => 1 - x;
    case ActivationType.SELU:
      // https://arxiv.org/pdf/1706.02515.pdf
      return (x) => {
        const alpha = 1.6732632423543772848170429916717;
        const scale = 1.0507009873554804934193349852946;
        const fx = x > 0 ? x : alpha * Math.exp(x) - alpha;
        return fx * scale;
      };
    case ActivationType.SIGMOID:
    default:
      return (x) => 1 / (1 + Math.pow(Math.E, -4.9 * x));
  }
};

export { getActivationFunction, ActivationType };
export type { ActivationFunction, ActivationTypeName };
