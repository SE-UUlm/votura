import { expect, test } from 'vitest';
import { getKeyPair } from './index.js';
import { modAdd, modMultiply } from 'bigint-crypto-utils';

test('getKeyPair', { timeout: 60000 }, async () => {
  const bitsPrimeP = 128;
  const { privateKey } = await getKeyPair(bitsPrimeP);
  const { primeP, primeQ } = privateKey;
  expect(modAdd([modMultiply([primeQ, 2n], primeP), 1n], primeP)).toBe(0n);
});
