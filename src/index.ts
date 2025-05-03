import { getGeneratorForPrimes } from './utils.js';
import {
  isProbablyPrime,
  modAdd,
  modInv,
  modMultiply,
  modPow,
  prime,
  randBetween,
} from 'bigint-crypto-utils';

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
    const privateKey = randBetween(primeP, 1n);
    const publicKey = modPow(generator, privateKey, primeP);
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

export const getKeyPair = async (
  bitsPrimeP: number = 2048,
): Promise<KeyPair> => {
  let primeP = await prime(bitsPrimeP);
  let probablePrimeQ = modMultiply(
    [modAdd([primeP, -1n], primeP), modInv(2n, primeP)],
    primeP,
  );

  let result = await isProbablyPrime(probablePrimeQ);

  while (!result) {
    primeP = await prime(bitsPrimeP);
    probablePrimeQ = modMultiply(
      [modAdd([primeP, -1n], primeP), modInv(2n, primeP)],
      primeP,
    );
    result = await isProbablyPrime(probablePrimeQ);
  }

  return new KeyPair(primeP, probablePrimeQ);
};
