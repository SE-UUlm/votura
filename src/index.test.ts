import { describe, expect } from 'vitest';
import { type Ciphertext, getKeyPair } from './index.js';
import { modAdd, modMultiply, modPow } from 'bigint-crypto-utils';
import { voturaTest } from './voturaTest.js';

voturaTest('getKeyPair', { timeout: 60000 }, async () => {
  const bitsPrimeP = 128;
  const { privateKey } = await getKeyPair(bitsPrimeP);
  const { primeP, primeQ } = privateKey;
  expect(modAdd([modMultiply([primeQ, 2n], primeP), 1n], primeP)).toBe(0n);
});

describe('PublicKey', () => {
  voturaTest('encrypt', ({ keyPair }) => {
    const { publicKey } = keyPair;
    const randomness = 10n;
    const plaintext = 123456789n;

    const cyphertext = publicKey.encrypt(plaintext, randomness);

    expect(cyphertext[0][0]).toBe(
      modPow(publicKey.generator, randomness, publicKey.primeP),
    );
    expect(cyphertext[0][1]).toBe(
      modMultiply(
        [plaintext, modPow(publicKey.publicKey, randomness, publicKey.primeP)],
        publicKey.primeP,
      ),
    );
    expect(cyphertext[1]).toBe(randomness);
  });
});

describe('PrivateKey', () => {
  voturaTest('decrypt', ({ keyPair }) => {
    const ciphertext: Ciphertext = [
      1048576n,
      74111364892091862126244320048683329486n,
    ];
    const plaintext = keyPair.privateKey.decrypt(ciphertext);

    expect(plaintext).toBe(123456789n);
  });
});
