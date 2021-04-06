export const uuid = (): string => {
  const uuid = [8, 4, 4, 4, 12].map((segmentLength: number) => {
    const segment = Array(segmentLength);

    for (let i = 0; i < segmentLength; i++)
      // ToUint32 http://www.ecma-international.org/ecma-262/5.1/#sec-11.7.3
      segment[i] = (Math.random() * 0xf) >>> 0;

    return segment;
  });

  uuid[2][0] &= 0x3;
  uuid[2][1] |= 0x8;
  uuid[3][0] = 0x4;

  return uuid.map((segment: number[]) => segment.map((n) => n.toString(16)).join('')).join('-');
};

// Taken from here: https://stackoverflow.com/questions/44230998/how-to-get-a-random-enum-in-typescript
export const randomEnum = <T>(enumToPick: T): T[keyof T] => {
  const keys = Object.keys(enumToPick).filter((k) => !(Math.abs(Number.parseInt(k)) + 1));
  const enumKey = keys[Math.floor(Math.random() * keys.length)];
  return enumToPick[enumKey];
};

export const pickOne = <T>(list: T[]): T => {
  if (list.length === 0) return null;

  const i = Math.floor(randomBetween(0, list.length));
  return list[i];
};

export const pickMany = <T>(list: T[], n: number): Array<T> => {
  const result: T[] = [];
  const source: T[] = [...list];

  n = Math.min(n, list.length);

  while (result.length < n) {
    const i = Math.floor(randomBetween(0, source.length));
    result.push(...source.splice(i, 1));
  }

  return result;
};

export const randomBetween = (min: number, max: number): number => {
  return Math.random() * (max - min) + min;
};

const innovation: IterableIterator<number> = innovationGeneratorFunction();

function* innovationGeneratorFunction(i = 0) {
  while (true) yield i++;
}

export const generateInnovation = (): number => {
  return innovation.next().value;
};

// TODO: This isn't very elegant... could probably do with a rethink
type Link = {
  from: {
    id: string;
  };
  to: {
    id: string;
  };
};

export const isRecurrent = <T extends Link>(connection: T, connections: T[]): boolean => {
  const startNode = connection.from;
  const stack = [connection];

  while (stack.length) {
    connection = stack.shift();
    if (connection.to.id === startNode.id) return true;

    stack.push(...connections.filter((gene) => gene.from.id === connection.to.id));
  }

  return false;
};
