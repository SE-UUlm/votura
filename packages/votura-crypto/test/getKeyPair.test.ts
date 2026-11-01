import type * as bigintCryptoUtils from 'bigint-crypto-utils';
import { isProbablyPrime, prime } from 'bigint-crypto-utils';
import { afterEach, describe, expect, test, vi } from 'vitest';
import { getKeyPair } from '../src/index.js';

// Spies only, except for the large key test, which fixes prime() instead of searching a 2048 bit prime.
vi.mock('bigint-crypto-utils', async (importOriginal) => {
  const original = await importOriginal<typeof bigintCryptoUtils>();
  return {
    ...original,
    prime: vi.fn(original.prime),
    isProbablyPrime: vi.fn(original.isProbablyPrime),
  };
});

const SAFE_PRIME_P = 23n;
const PRIME_Q = 11n;

afterEach(() => {
  vi.clearAllMocks();
});

describe('getKeyPair', () => {
  test('generates small keys without worker threads', async () => {
    const { publicKey } = await getKeyPair(20);

    expect(publicKey.getPrimeP()).toBe(2n * publicKey.getPrimeQ() + 1n);
    expect(vi.mocked(prime)).not.toHaveBeenCalled();
    expect(vi.mocked(isProbablyPrime)).toHaveBeenCalled();
    for (const call of vi.mocked(isProbablyPrime).mock.calls) {
      expect(call[2]).toBe(true);
    }
  });

  test('generates large keys with worker threads', async () => {
    vi.mocked(prime).mockResolvedValueOnce(SAFE_PRIME_P);

    const { publicKey } = await getKeyPair(2048);

    expect(vi.mocked(prime)).toHaveBeenCalledWith(2048);
    expect(vi.mocked(isProbablyPrime)).toHaveBeenCalledWith(PRIME_Q, 16, false);
    expect(publicKey.getPrimeP()).toBe(SAFE_PRIME_P);
    expect(publicKey.getPrimeQ()).toBe(PRIME_Q);
  });
});
