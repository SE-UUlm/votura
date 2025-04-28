import { expect, test } from 'vitest';
import { getBitsOfBigInt, getPrime, getRandomBigInt } from './utils.js';
import { primalityTest } from 'miller-rabin-primality';

test('getBitsOfBigInt', () => {
  expect(getBitsOfBigInt(BigInt(1))).toBe(1);
  expect(getBitsOfBigInt(BigInt(100))).toBe(7);
  expect(getBitsOfBigInt(BigInt(10000))).toBe(14);
});

test('getRandomBigInt', () => {
  expect(getBitsOfBigInt(getRandomBigInt())).toBe(2048);
  expect(getBitsOfBigInt(getRandomBigInt(1))).toBe(1);
  expect(getBitsOfBigInt(getRandomBigInt(100))).toBe(100);
});

test(
  'getPrime',
  { timeout: 60000 }, // prime generation can take a while
  async () => {
    const prime = await getPrime();
    expect(getBitsOfBigInt(prime)).toBe(2048);
    const result = await primalityTest(prime);
    expect(result.probablePrime).toBe(true);
  },
);
