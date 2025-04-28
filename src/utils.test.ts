import { expect, test } from 'vitest';
import {
  getBitsOfBigInt,
  getCofactor,
  getPrime,
  getRandomBigInt,
  getRandomBigIntFromInterval,
} from './utils.js';
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

test('getRandomBigIntFromInterval', { timeout: 60000 }, () => {
  const values: [bigint, bigint][] = [
    [1n, 5n],
    [1000n, 50000n],
    [getRandomBigInt(1), getRandomBigInt()],
  ];

  values.forEach(([min, max]) => {
    const random = getRandomBigIntFromInterval(min, max);
    expect(random).toBeLessThanOrEqual(max);
    expect(random).toBeGreaterThanOrEqual(min);
  });
});

test('getCofactor', () => {
  expect(getCofactor(23n, 11n)).toBe((23n - 1n) / 11n);
  expect(() => getCofactor(23n, 7n)).toThrowError(
    'Invalid: (p - 1) is not divisible by q',
  );
  // chose this example because I could not find two primes that violate this
  expect(() => getCofactor(13n, 4n)).toThrowError(
    'Invalid: cofactor j is not even',
  );
});
