import { describe, expect, it } from 'vitest';
import { generateKeyPair } from '../../src/auth/generateJWTKeyPair.js';

describe('generateKeyPair', () => {
  it('should return an object with privateKey and publicKey strings in PEM format', () => {
    const { privateKey, publicKey } = generateKeyPair();

    expect(typeof privateKey).toBe('string');
    expect(typeof publicKey).toBe('string');

    expect(privateKey).toMatch(/-----BEGIN PRIVATE KEY-----[\s\S]+-----END PRIVATE KEY-----/);
    expect(publicKey).toMatch(/-----BEGIN PUBLIC KEY-----[\s\S]+-----END PUBLIC KEY-----/);
  });

  it('should generate unique key pairs on each invocation', () => {
    const a = generateKeyPair();
    const b = generateKeyPair();

    // At least one of the keys should differ
    expect(a.privateKey).not.toBe(b.privateKey);
    expect(a.publicKey).not.toBe(b.publicKey);
  });
});
