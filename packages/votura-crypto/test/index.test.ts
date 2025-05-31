import { describe, expect } from 'vitest';
import { type Ciphertext, getKeyPair } from '../src/index.js';
import { modAdd, modMultiply, modPow } from 'bigint-crypto-utils';
import { voturaTest } from './voturaTest.js';

voturaTest('getKeyPair', { timeout: 60000 }, async () => {
  const bitsPrimeP = 128;
  const { privateKey } = await getKeyPair(bitsPrimeP);
  const { primeP, primeQ } = privateKey;
  expect(modAdd([modMultiply([primeQ, 2n], primeP), 1n], primeP)).toBe(0n);
});

describe('PublicKey', () => {
  voturaTest('encrypt', ({ keyPair, randomness, plaintext }) => {
    const { publicKey } = keyPair;

    const encryptedText = publicKey.encrypt(plaintext, randomness);

    expect(encryptedText[0][0]).toBe(modPow(publicKey.generator, randomness, publicKey.primeP));
    expect(encryptedText[0][1]).toBe(
      modMultiply(
        [plaintext, modPow(publicKey.publicKey, randomness, publicKey.primeP)],
        publicKey.primeP,
      ),
    );
    expect(encryptedText[1]).toBe(randomness);
  });
});

describe('PrivateKey', () => {
  voturaTest('decrypt', ({ keyPair, plaintext }) => {
    const ciphertext: Ciphertext = [1048576n, 74111364892091862126244320048683329486n];
    const decryptedText = keyPair.privateKey.decrypt(ciphertext);

    expect(decryptedText).toBe(plaintext);
  });
  // Dummy test that will fail
  voturaTest('dummy failing test', () => {
    expect(1n).toBe(2n);
  });
});
