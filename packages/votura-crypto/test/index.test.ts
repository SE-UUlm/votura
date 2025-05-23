import { describe, expect } from 'vitest';
import { type Ciphertext, getKeyPair, Tallying, ZeroKnowledgeProof, type ZKProof } from '../src/index.js';
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

  voturaTest('createDecryptionProof', ({ keyPair, ciphertext }) => {
    const proof = keyPair.privateKey.createDecryptionProof(ciphertext);
    const proof2 = keyPair.privateKey.createDecryptionProof(ciphertext);

    expect(proof.commitment.length).toBe(2);
    expect(typeof proof.challenge).toBe('bigint');
    expect(typeof proof.response).toBe('bigint');

    expect(proof.challenge >= 0n).toBe(true);
    expect(proof.challenge < keyPair.publicKey.primeQ).toBe(true);
    expect(proof.response >= 0n).toBe(true);
    expect(proof.response < keyPair.publicKey.primeQ).toBe(true);

    expect(proof).not.toEqual(proof2);
  });
});

describe('Tallying', () => {
  voturaTest('aggregateCiphertexts', ({ keyPair, plaintext, ciphertext }) => {
    const { publicKey } = keyPair;
    const plaintexts = [plaintext, 123123123n, 456456456n, 789789789n];
    const ciphertexts: Ciphertext[] = plaintexts.map(p => publicKey.encrypt(p)[0]);

    let expectedAlpha = 1n;
    let expectedBeta = 1n;
    for (const [a, b] of ciphertexts) {
      expectedAlpha = modMultiply([expectedAlpha, a], publicKey.primeP);
      expectedBeta = modMultiply([expectedBeta, b], publicKey.primeP);
    }

    const tally = new Tallying(publicKey);
    const [aggAlpha, aggBeta] = tally.aggregateCiphertexts(ciphertexts);
    const [aggAlpha2, aggBeta2] = tally.aggregateCiphertexts(ciphertexts);
    expect([aggAlpha, aggBeta]).toEqual([expectedAlpha, expectedBeta]);
    expect([aggAlpha2, aggBeta2]).toEqual([expectedAlpha, expectedBeta]);

    const singleCiphertext = ciphertext;
    const [singleAlpha, singleBeta] = tally.aggregateCiphertexts([singleCiphertext]);
    expect(singleAlpha).toBe(singleCiphertext[0]);
    expect(singleBeta).toBe(singleCiphertext[1]);

    const [emptyAlpha, emptyBeta] = tally.aggregateCiphertexts([]);
    expect(emptyAlpha).toBe(1n);
    expect(emptyBeta).toBe(1n);
  });
});

describe('ZeroKnowledgeProof', () => {
  voturaTest('createSimulatedEncryptionProof', ({ keyPair, plaintext, ciphertext }) => {
    const { publicKey } = keyPair;
    const zkp = new ZeroKnowledgeProof(publicKey);

    const proof = zkp.createSimulatedEncryptionProof(plaintext, ciphertext);
    const proof2 = zkp.createSimulatedEncryptionProof(plaintext, ciphertext);

    expect(proof.commitment.length).toBe(2);
    expect(typeof proof.challenge).toBe('bigint');
    expect(typeof proof.response).toBe('bigint');

    expect(proof.challenge >= 0n).toBe(true);
    expect(proof.challenge < publicKey.primeQ).toBe(true);
    expect(proof.response >= 0n).toBe(true);
    expect(proof.response < publicKey.primeQ).toBe(true);

    expect(proof).not.toEqual(proof2);
  });

  voturaTest('createRealEncryptionProof', ({ keyPair, plaintext, randomness }) => {
    const { publicKey } = keyPair;
    const plaintexts = [plaintext, 123123123n, 456456456n, 789789789n];
    const ciphertexts: Ciphertext[] = plaintexts.map(p => publicKey.encrypt(p)[0]);
    const realIndex = plaintexts.indexOf(plaintext);

    const zkp = new ZeroKnowledgeProof(publicKey);
    const simulatedZKPs: ZKProof[] = [];
    for (let i = 0; i < plaintexts.length; i++) {
      const plainT = plaintexts[i];
      const cipherT = ciphertexts[i];
      if (plainT !== undefined && cipherT !== undefined) {
        const simulatedProof = zkp.createSimulatedEncryptionProof(plainT, cipherT);
        simulatedZKPs.push(simulatedProof);
      }
    }

    const proof = zkp.createRealEncryptionProof(simulatedZKPs, realIndex, randomness);
    const proof2 = zkp.createRealEncryptionProof(simulatedZKPs, realIndex, randomness);

    expect(proof.commitment.length).toBe(2);
    expect(typeof proof.challenge).toBe('bigint');
    expect(typeof proof.response).toBe('bigint');

    expect(proof.challenge >= 0n).toBe(true);
    expect(proof.challenge < publicKey.primeQ).toBe(true);
    expect(proof.response >= 0n).toBe(true);
    expect(proof.response < publicKey.primeQ).toBe(true);

    expect(proof).not.toEqual(proof2);
  });

  voturaTest('createDisjunctiveEncryptionProof', ({ keyPair, plaintext, randomness }) => {
    const { publicKey } = keyPair;
    const plaintexts = [plaintext, 123123123n, 456456456n, 789789789n];
    const ciphertexts: Ciphertext[] = plaintexts.map(p => publicKey.encrypt(p)[0]);
    const realIndex = plaintexts.indexOf(plaintext);

    const zkp = new ZeroKnowledgeProof(publicKey);
    const proofs = zkp.createDisjunctiveEncryptionProof(plaintexts, ciphertexts, realIndex, randomness);
    const proofs2 = zkp.createDisjunctiveEncryptionProof(plaintexts, ciphertexts, realIndex, randomness);

    expect(proofs.length).toBe(plaintexts.length);

    proofs.forEach(proof => {
      expect(proof.commitment.length).toBe(2);
      expect(typeof proof.challenge).toBe('bigint');
      expect(typeof proof.response).toBe('bigint');

      expect(proof.challenge >= 0n).toBe(true);
      expect(proof.challenge < publicKey.primeQ).toBe(true);
      expect(proof.response >= 0n).toBe(true);
      expect(proof.response < publicKey.primeQ).toBe(true);
    });

    expect(proofs).not.toEqual(proofs2);
  });

  voturaTest('verifyEncryptionProof', ({ keyPair, plaintext, ciphertext }) => {
    const { publicKey } = keyPair;
    const zkp = new ZeroKnowledgeProof(publicKey);
    const validProof = zkp.createSimulatedEncryptionProof(plaintext, ciphertext);

    const isValid = zkp.verifyEncryptionProof(plaintext, ciphertext, validProof);
    expect(isValid).toBe(true);

    const invalidProof1: ZKProof = {
      commitment: [(validProof.commitment[0] + 1n) % publicKey.primeP, validProof.commitment[1]],
      challenge: validProof.challenge,
      response: validProof.response,
    };
    const isValid1 = zkp.verifyEncryptionProof(plaintext, ciphertext, invalidProof1);
    expect(isValid1).toBe(false);

    const invalidProof2: ZKProof = {
      commitment: [validProof.commitment[0], (validProof.commitment[1] + 1n) % publicKey.primeP],
      challenge: validProof.challenge,
      response: validProof.response,
    };
    const isValid2 = zkp.verifyEncryptionProof(plaintext, ciphertext, invalidProof2);
    expect(isValid2).toBe(false);

    const invalidProof3: ZKProof = {
      commitment: [validProof.commitment[0], validProof.commitment[1]],
      challenge: (validProof.challenge + 1n) % publicKey.primeQ,
      response: validProof.response,
    };
    const isValid3 = zkp.verifyEncryptionProof(plaintext, ciphertext, invalidProof3);
    expect(isValid3).toBe(false);

    const invalidProof4: ZKProof = {
      commitment: [validProof.commitment[0], validProof.commitment[1]],
      challenge: validProof.challenge,
      response: (validProof.response + 1n) % publicKey.primeQ,
    };
    const isValid4 = zkp.verifyEncryptionProof(plaintext, ciphertext, invalidProof4);
    expect(isValid4).toBe(false);
  });

  voturaTest('verifyDisjunctiveEncryptionProof', ({ keyPair, plaintext, randomness }) => {
    const { publicKey } = keyPair;
    const plaintexts = [plaintext, 123123123n, 456456456n, 789789789n];
    const ciphertexts: Ciphertext[] = plaintexts.map(p => publicKey.encrypt(p)[0]);
    const realIndex = plaintexts.indexOf(plaintext);

    const zkp = new ZeroKnowledgeProof(publicKey);
    const validProofs = zkp.createDisjunctiveEncryptionProof(plaintexts, ciphertexts, realIndex, randomness);

    const isValid = zkp.verifyDisjunctiveEncryptionProof(plaintexts, ciphertexts, validProofs);
    expect(isValid).toBe(true);

    const invalidProofs1: ZKProof[] = validProofs.map((proof, index) => ({
      commitment: index === 0
        ? [(proof.commitment[0] + 1n) % publicKey.primeP, proof.commitment[1]]
        : [proof.commitment[0], proof.commitment[1]],
      challenge: proof.challenge,
      response: proof.response,
    }));
    const isValid1 = zkp.verifyDisjunctiveEncryptionProof(plaintexts, ciphertexts, invalidProofs1);
    expect(isValid1).toBe(false);

    const invalidProofs2: ZKProof[] = validProofs.map((proof, index) => ({
      commitment: index === 1
        ? [proof.commitment[0], (proof.commitment[1] + 1n) % publicKey.primeP]
        : [proof.commitment[0], proof.commitment[1]],
      challenge: proof.challenge,
      response: proof.response,
    }));
    const isValid2 = zkp.verifyDisjunctiveEncryptionProof(plaintexts, ciphertexts, invalidProofs2);
    expect(isValid2).toBe(false);

    const invalidProofs3: ZKProof[] = validProofs.map((proof, index) => ({
      commitment: [proof.commitment[0], proof.commitment[1]],
      challenge: index === 2
        ? (proof.challenge + 1n) % publicKey.primeQ
        : proof.challenge,
      response: proof.response,
    }));
    const isValid3 = zkp.verifyDisjunctiveEncryptionProof(plaintexts, ciphertexts, invalidProofs3);
    expect(isValid3).toBe(false);

    const invalidProofs4: ZKProof[] = validProofs.map((proof, index) => ({
      commitment: [proof.commitment[0], proof.commitment[1]],
      challenge: proof.challenge,
      response: index === 3
        ? (proof.response + 1n) % publicKey.primeQ
        : proof.response,
    }));
    const isValid4 = zkp.verifyDisjunctiveEncryptionProof(plaintexts, ciphertexts, invalidProofs4);
    expect(isValid4).toBe(false);
  });

  voturaTest('verifyDecryptionProof', ({ keyPair, plaintext, ciphertext }) => {
    const { publicKey } = keyPair;
    const validProof = keyPair.privateKey.createDecryptionProof(ciphertext);

    const zkp = new ZeroKnowledgeProof(publicKey);
    const isValid = zkp.verifyDecryptionProof(plaintext, ciphertext, validProof);
    expect(isValid).toBe(true);

    const invalidProof1: ZKProof = {
      commitment: [(validProof.commitment[0] + 1n) % publicKey.primeP, validProof.commitment[1]],
      challenge: validProof.challenge,
      response: validProof.response,
    };
    const isValid1 = zkp.verifyDecryptionProof(plaintext, ciphertext, invalidProof1);
    expect(isValid1).toBe(false);

    const invalidProof2: ZKProof = {
      commitment: [validProof.commitment[0], (validProof.commitment[1] + 1n) % publicKey.primeP],
      challenge: validProof.challenge,
      response: validProof.response,
    };
    const isValid2 = zkp.verifyDecryptionProof(plaintext, ciphertext, invalidProof2);
    expect(isValid2).toBe(false);

    const invalidProof3: ZKProof = {
      commitment: [validProof.commitment[0], validProof.commitment[1]],
      challenge: (validProof.challenge + 1n) % publicKey.primeQ,
      response: validProof.response,
    };
    const isValid3 = zkp.verifyDecryptionProof(plaintext, ciphertext, invalidProof3);
    expect(isValid3).toBe(false);

    const invalidProof4: ZKProof = {
      commitment: [validProof.commitment[0], validProof.commitment[1]],
      challenge: validProof.challenge,
      response: (validProof.response + 1n) % publicKey.primeQ,
    };
    const isValid4 = zkp.verifyDecryptionProof(plaintext, ciphertext, invalidProof4);
    expect(isValid4).toBe(false);
  });
});
