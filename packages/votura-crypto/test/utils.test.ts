import { describe, expect } from 'vitest';
import { getBitsOfBigInt, getCofactor, getFiatShamirChallenge, getGeneratorForPrimes } from '../src/utils.js';
import { gcd, modPow } from 'bigint-crypto-utils';
import { voturaTest } from './voturaTest.js';

describe('Utility Functions', () => {
  voturaTest('getBitsOfBigInt', () => {
    expect(getBitsOfBigInt(BigInt(1))).toBe(1);
    expect(getBitsOfBigInt(BigInt(100))).toBe(7);
    expect(getBitsOfBigInt(BigInt(10000))).toBe(14);
  });

  voturaTest('getCofactor', () => {
    expect(getCofactor(23n, 11n)).toBe((23n - 1n) / 11n);
    expect(() => getCofactor(23n, 7n)).toThrowError('Invalid: (p - 1) is not divisible by q');
    // chose this example because I could not find two primes that violate this
    expect(() => getCofactor(13n, 4n)).toThrowError('Invalid: cofactor j is not even');
  });

  voturaTest('getFiatShamirChallenge', ({ keyPair, ciphertext, randomness }) => {
    const { publicKey } = keyPair;

    const commitmentA = modPow(publicKey.generator, randomness, publicKey.primeP);
    const commitmentB = modPow(ciphertext[0], randomness, publicKey.primeP);

    const partsToHash: string[] = [];
    partsToHash.push(commitmentA.toString());
    partsToHash.push(commitmentB.toString());

    const challenge = getFiatShamirChallenge(partsToHash, publicKey.primeQ);
    const challenge2 = getFiatShamirChallenge(partsToHash, publicKey.primeQ);

    expect(challenge).toBe(challenge2);
    expect(typeof challenge).toBe('bigint');
    expect(challenge >= 0n).toBe(true);
    expect(challenge < publicKey.primeQ).toBe(true);
  });

  voturaTest('getGeneratorForPrimes', () => {
    const generator = getGeneratorForPrimes(23n, 11n);
    expect(generator).toBeLessThan(23n);
    expect(generator).toBeGreaterThan(1n);
    expect(gcd(generator, 23n)).toBe(1n);
    expect(modPow(generator, 2, 23n)).not.toBe(1n);
  });
});
