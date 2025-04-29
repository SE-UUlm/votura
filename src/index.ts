import {
  getGeneratorForPrimes,
  getPrime,
  getRandomBigIntFromInterval,
} from './utils.js';
import { primalityTest } from 'miller-rabin-primality';

export * from './utils.js';

export class PublicKey {
  primeP: bigint;
  primeQ: bigint;
  generator: bigint;
  publicKey: bigint;

  constructor(
    primeP: bigint,
    primeQ: bigint,
    generator: bigint,
    publicKey: bigint,
  ) {
    this.primeP = primeP;
    this.primeQ = primeQ;
    this.generator = generator;
    this.publicKey = publicKey;
  }
}

export class PrivateKey extends PublicKey {
  privateKey: bigint;

  constructor(
    primeP: bigint,
    primeQ: bigint,
    generator: bigint,
    publicKey: bigint,
    privateKey: bigint,
  ) {
    super(primeP, primeQ, generator, publicKey);
    this.privateKey = privateKey;
  }
}

export class KeyPair {
  publicKey: PublicKey;
  privateKey: PrivateKey;

  constructor(primeP: bigint, primeQ: bigint) {
    if ((primeP - 1n) % primeQ !== 0n) {
      throw new Error('Invalid: (p - 1) is not divisible by q');
    }

    const generator = getGeneratorForPrimes(primeP, primeQ);
    const privateKey = getRandomBigIntFromInterval(1n, primeP);
    const publicKey = (generator ^ privateKey) % primeP;
    this.privateKey = new PrivateKey(
      primeP,
      primeQ,
      generator,
      publicKey,
      privateKey,
    );
    this.publicKey = new PublicKey(primeP, primeQ, generator, publicKey);
  }
}

// TODO: I am not sure if I like this async await hell ...
// TODO: The amount of bits for primeP need to be configurable!
export const getKeyPair = async (bits?: number): Promise<KeyPair> => {
  let primeQ = await getPrime(bits);
  let probablePrimeP = 2n * primeQ + 1n;

  // check for 2048 bits here by incrementing the factor???

  let result = await primalityTest(probablePrimeP);

  while (!result.probablePrime) {
    primeQ = await getPrime(bits);
    probablePrimeP = 2n * primeQ + 1n;
    result = await primalityTest(probablePrimeP);
  }

  return new KeyPair(probablePrimeP, primeQ);
};
