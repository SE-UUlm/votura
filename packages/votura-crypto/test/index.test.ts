import { modAdd, modInv, modMultiply, modPow, randBetween } from 'bigint-crypto-utils';
import { getFiatShamirChallenge } from './utils.js';
// import { modAdd, modMultiply, modPow } from 'bigint-crypto-utils';
import { describe, expect } from 'vitest';
import {
  type Ciphertext,
  getKeyPair,
  type PublicKey,
  Tallying,
  ZeroKnowledgeProof,
  type ZKProof,
} from '../src/index.js';
import { voturaTest } from './voturaTest.js';

voturaTest('getKeyPair', { timeout: 120000 }, async () => {
  const bitsPrimeP = 128;
  const { privateKey } = await getKeyPair(bitsPrimeP);
  const primeP = privateKey.getPrimeP();
  const primeQ = privateKey.getPrimeQ();
  expect(modAdd([modMultiply([primeQ, 2n], primeP), 1n], primeP)).toBe(0n);
});

describe('PublicKey', () => {
  voturaTest('encrypt', ({ keyPair, randomness, plaintext }) => {
    const { publicKey } = keyPair;

    const encryptedText = publicKey.encrypt(plaintext, randomness);

    expect(encryptedText[0][0]).toBe(
      modPow(publicKey.getGenerator(), randomness, publicKey.getPrimeP()),
    );
    expect(encryptedText[0][1]).toBe(
      modMultiply(
        [plaintext, modPow(publicKey.getPublicKey(), randomness, publicKey.getPrimeP())],
        publicKey.getPrimeP(),
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
    expect(proof.challenge < keyPair.publicKey.getPrimeQ()).toBe(true);
    expect(proof.response >= 0n).toBe(true);
    expect(proof.response < keyPair.publicKey.getPrimeQ()).toBe(true);

    expect(proof).not.toEqual(proof2);
  });
});

describe('Tallying', () => {
  voturaTest('aggregateCiphertexts', ({ keyPair, plaintext, ciphertext, randomness }) => {
    const { publicKey } = keyPair;
    const plaintexts = [plaintext, 123123123n, 456456456n, 789789789n];
    const ciphertexts: Ciphertext[] = plaintexts.map((p) => publicKey.encrypt(p, randomness)[0]);

    let expectedAlpha = 1n;
    let expectedBeta = 1n;
    for (const [a, b] of ciphertexts) {
      expectedAlpha = modMultiply([expectedAlpha, a], publicKey.getPrimeP());
      expectedBeta = modMultiply([expectedBeta, b], publicKey.getPrimeP());
    }

    const tally = new Tallying(publicKey);
    // using bracket notation to access private method for testing purposes
    // eslint-disable-next-line @typescript-eslint/dot-notation
    const [aggAlpha, aggBeta] = tally['aggregateCiphertexts'](ciphertexts);
    // eslint-disable-next-line @typescript-eslint/dot-notation
    const [aggAlpha2, aggBeta2] = tally['aggregateCiphertexts'](ciphertexts);
    expect([aggAlpha, aggBeta]).toEqual([expectedAlpha, expectedBeta]);
    expect([aggAlpha2, aggBeta2]).toEqual([expectedAlpha, expectedBeta]);

    const singleCiphertext = ciphertext;
    // eslint-disable-next-line @typescript-eslint/dot-notation
    const [singleAlpha, singleBeta] = tally['aggregateCiphertexts']([singleCiphertext]);
    expect(singleAlpha).toBe(singleCiphertext[0]);
    expect(singleBeta).toBe(singleCiphertext[1]);

    // eslint-disable-next-line @typescript-eslint/dot-notation
    const [emptyAlpha, emptyBeta] = tally['aggregateCiphertexts']([]);
    expect(emptyAlpha).toBe(1n);
    expect(emptyBeta).toBe(1n);
  });

  voturaTest('aggregateVotes', ({ keyPair, randomness }) => {
    const { publicKey } = keyPair;
    const plainNo = 1n; // = modPow(this.pk.generator, 0);
    const plainYes = publicKey.getGenerator(); // = modPow(this.pk.generator, 1);

    const ballotSectionA1: bigint[][] = [
      // section A: max. 4 votes, 4 choices
      [plainNo, plainYes, plainNo, plainNo], // voter 1: choice 2
      [plainYes, plainNo, plainNo, plainNo], // voter 1: choice 1
      [plainYes, plainNo, plainNo, plainNo], // voter 1: choice 1
      [plainNo, plainNo, plainYes, plainNo], // voter 1: choice 3
    ];
    const ballotSectionB1: bigint[][] = [
      // section B: max. 2 votes, 3 choices
      [plainNo, plainNo, plainYes], // voter 1: choice 3
      [plainNo, plainYes, plainNo], // voter 1: choice 2 (=section A choice 4)
    ];
    const ballotSectionA2: bigint[][] = [
      // section A: max. 4 votes, 4 choices
      [plainNo, plainNo, plainYes, plainNo], // voter 2: choice 3
      [plainNo, plainYes, plainNo, plainNo], // voter 2: choice 2
      [plainNo, plainNo, plainYes, plainNo], // voter 2: choice 3
      [plainYes, plainNo, plainNo, plainNo], // voter 2: choice 1
    ];
    const votesA1: Ciphertext[][] = ballotSectionA1.map((vote) =>
      vote.map((choice) => publicKey.encrypt(choice, randomness)[0]),
    );
    const votesB1: Ciphertext[][] = ballotSectionB1.map((vote) =>
      vote.map((choice) => publicKey.encrypt(choice, randomness)[0]),
    );
    const votesA2: Ciphertext[][] = ballotSectionA2.map((vote) =>
      vote.map((choice) => publicKey.encrypt(choice, randomness + 1n)[0]),
    );

    const tally = new Tallying(publicKey);
    const aggVotesA1 = tally.aggregateVotes(votesA1); // section A of voter 1
    const aggVotesB1 = tally.aggregateVotes(votesB1); // section B of voter 1
    const aggVotesA2 = tally.aggregateVotes(votesA2); // section A of voter 2
    const votesA = votesA1.concat(votesA2);
    const aggVotesA = tally.aggregateVotes(votesA); // section A of all voters

    const resultA1 = aggVotesA1.map((ciphertext) => {
      return keyPair.privateKey.decrypt(ciphertext);
    });
    const resultB1 = aggVotesB1.map((ciphertext) => {
      return keyPair.privateKey.decrypt(ciphertext);
    });
    const resultA2 = aggVotesA2.map((ciphertext) => {
      return keyPair.privateKey.decrypt(ciphertext);
    });
    const resultA = aggVotesA.map((ciphertext) => {
      return keyPair.privateKey.decrypt(ciphertext);
    });

    const sumA1: bigint[] = [2n, 1n, 1n, 0n]; // sum tallied manually
    const sumB1: bigint[] = [0n, 1n, 1n]; // sum tallied manually
    const sumA2: bigint[] = [1n, 1n, 2n, 0n]; // sum tallied manually
    const sumA: bigint[] = [3n, 2n, 3n, 0n]; // sum tallied manually
    resultA1.forEach((sum, index) => {
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      const encodedSum = modPow(publicKey.getGenerator(), sumA1[index]!, publicKey.getPrimeP());
      expect(sum).toBe(encodedSum);
    });
    resultB1.forEach((sum, index) => {
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      const encodedSum = modPow(publicKey.getGenerator(), sumB1[index]!, publicKey.getPrimeP());
      expect(sum).toBe(encodedSum);
    });
    resultA2.forEach((sum, index) => {
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      const encodedSum = modPow(publicKey.getGenerator(), sumA2[index]!, publicKey.getPrimeP());
      expect(sum).toBe(encodedSum);
    });
    resultA.forEach((sum, index) => {
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      const encodedSum = modPow(publicKey.getGenerator(), sumA[index]!, publicKey.getPrimeP());
      expect(sum).toBe(encodedSum);
    });

    const zero = publicKey.encrypt(plainNo)[0];
    const zeroRow = (cols: number): Ciphertext[] => Array(cols).fill(zero) as Ciphertext[];
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const lenA = votesA1[0]!.length;
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const lenB = votesB1[0]!.length;
    const votesA10 = votesA1.map((row) => [...row, ...zeroRow(lenB)]);
    const votes0B1 = votesB1.map((row) => [...zeroRow(lenA), ...row]);

    const votesTemp = votesA10.concat(votes0B1); // only different choices
    const votes1 = votesTemp.map((row, index) => {
      expect(row).toHaveLength(7);
      expect(row).not.toContain(undefined);

      const newRow: Ciphertext[] = []; // sec A choice 4 = sec B choice 2
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      newRow.push(row[0]!, row[1]!, row[2]!);
      if (index < votesA10.length) {
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        newRow.push(row[3]!);
      } else {
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        newRow.push(row[5]!);
      }
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      newRow.push(row[4]!, row[6]!);
      return newRow;
    });
    const aggVotes1 = tally.aggregateVotes(votes1); // all sections of voter 1

    const result1 = aggVotes1.map((ciphertext) => {
      return keyPair.privateKey.decrypt(ciphertext);
    });
    const sum1: bigint[] = [2n, 1n, 1n, 1n, 0n, 1n]; // sum tallied manually
    result1.forEach((sum, index) => {
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      const encodedSum = modPow(publicKey.getGenerator(), sum1[index]!, publicKey.getPrimeP());
      expect(sum).toBe(encodedSum);
    });
  });
});

describe('ZeroKnowledgeProof', () => {
  voturaTest('createSimulatedEncryptionProof', ({ keyPair, plaintext, ciphertext }) => {
    const { publicKey } = keyPair;
    const zkp = new ZeroKnowledgeProof(publicKey);

    // using bracket notation to access private method for testing purposes
    // eslint-disable-next-line @typescript-eslint/dot-notation
    const proof: ZKProof = zkp['createSimulatedEncryptionProof'](plaintext, ciphertext);
    // eslint-disable-next-line @typescript-eslint/dot-notation
    const proof2: ZKProof = zkp['createSimulatedEncryptionProof'](plaintext, ciphertext);

    expect(proof.commitment.length).toBe(2);
    expect(typeof proof.challenge).toBe('bigint');
    expect(typeof proof.response).toBe('bigint');

    expect(proof.challenge >= 0n).toBe(true);
    expect(proof.challenge < publicKey.getPrimeQ()).toBe(true);
    expect(proof.response >= 0n).toBe(true);
    expect(proof.response < publicKey.getPrimeQ()).toBe(true);

    expect(proof).not.toEqual(proof2);
  });

  voturaTest('createRealEncryptionProof', ({ keyPair, plaintext, randomness }) => {
    const { publicKey } = keyPair;
    const plaintexts = [plaintext, 123123123n, 456456456n, 789789789n];
    const ciphertexts: Ciphertext[] = plaintexts.map((p) => publicKey.encrypt(p, randomness)[0]);
    const realIndex = plaintexts.indexOf(plaintext);

    const zkp = new ZeroKnowledgeProof(publicKey);
    const simulatedZKPs: ZKProof[] = [];
    for (let i = 0; i < plaintexts.length; i++) {
      const plainT = plaintexts[i];
      const cipherT = ciphertexts[i];
      if (plainT !== undefined && cipherT !== undefined) {
        // using bracket notation to access private method for testing purposes
        // eslint-disable-next-line @typescript-eslint/dot-notation
        const simulatedProof: ZKProof = zkp['createSimulatedEncryptionProof'](plainT, cipherT);
        simulatedZKPs.push(simulatedProof);
      }
    }

    // eslint-disable-next-line @typescript-eslint/dot-notation
    const proof: ZKProof = zkp['createRealEncryptionProof'](simulatedZKPs, realIndex, randomness);
    // eslint-disable-next-line @typescript-eslint/dot-notation
    const proof2: ZKProof = zkp['createRealEncryptionProof'](simulatedZKPs, realIndex, randomness);

    expect(proof.commitment.length).toBe(2);
    expect(typeof proof.challenge).toBe('bigint');
    expect(typeof proof.response).toBe('bigint');

    expect(proof.challenge >= 0n).toBe(true);
    expect(proof.challenge < publicKey.getPrimeQ()).toBe(true);
    expect(proof.response >= 0n).toBe(true);
    expect(proof.response < publicKey.getPrimeQ()).toBe(true);

    expect(proof).not.toEqual(proof2);
  });

  voturaTest('createDisjunctiveEncryptionProof', ({ keyPair, plaintext, randomness }) => {
    const { publicKey } = keyPair;
    const plaintexts = [plaintext, 123123123n, 456456456n, 789789789n];
    const ciphertexts: Ciphertext[] = plaintexts.map((p) => publicKey.encrypt(p, randomness)[0]);
    const realIndex = plaintexts.indexOf(plaintext);

    const zkp = new ZeroKnowledgeProof(publicKey);
    const proofs = zkp.createDisjunctiveEncryptionProof(ciphertexts, realIndex, randomness);
    const proofs2 = zkp.createDisjunctiveEncryptionProof(ciphertexts, realIndex, randomness);

    expect(proofs.length).toBe(plaintexts.length);

    proofs.forEach((proof) => {
      expect(proof.commitment.length).toBe(2);
      expect(typeof proof.challenge).toBe('bigint');
      expect(typeof proof.response).toBe('bigint');

      expect(proof.challenge >= 0n).toBe(true);
      expect(proof.challenge < publicKey.getPrimeQ()).toBe(true);
      expect(proof.response >= 0n).toBe(true);
      expect(proof.response < publicKey.getPrimeQ()).toBe(true);
    });

    expect(proofs).not.toEqual(proofs2);
  });

  voturaTest('verifyEncryptionProof', ({ keyPair, plaintext, ciphertext }) => {
    const { publicKey } = keyPair;
    const zkp = new ZeroKnowledgeProof(publicKey);
    // using bracket notation to access private method for testing purposes
    // eslint-disable-next-line @typescript-eslint/dot-notation
    const validProof: ZKProof = zkp['createSimulatedEncryptionProof'](plaintext, ciphertext);

    // eslint-disable-next-line @typescript-eslint/dot-notation
    const isValid: boolean = zkp['verifyEncryptionProof'](plaintext, ciphertext, validProof);
    expect(isValid).toBe(true);

    const invalidProof1: ZKProof = {
      commitment: [
        (validProof.commitment[0] + 1n) % publicKey.getPrimeP(),
        validProof.commitment[1],
      ],
      challenge: validProof.challenge,
      response: validProof.response,
    };

    // eslint-disable-next-line @typescript-eslint/dot-notation
    const isValid1: boolean = zkp['verifyEncryptionProof'](plaintext, ciphertext, invalidProof1);
    expect(isValid1).toBe(false);

    const invalidProof2: ZKProof = {
      commitment: [
        validProof.commitment[0],
        (validProof.commitment[1] + 1n) % publicKey.getPrimeP(),
      ],
      challenge: validProof.challenge,
      response: validProof.response,
    };

    // eslint-disable-next-line @typescript-eslint/dot-notation
    const isValid2: boolean = zkp['verifyEncryptionProof'](plaintext, ciphertext, invalidProof2);
    expect(isValid2).toBe(false);

    const invalidProof3: ZKProof = {
      commitment: [validProof.commitment[0], validProof.commitment[1]],
      challenge: (validProof.challenge + 1n) % publicKey.getPrimeQ(),
      response: validProof.response,
    };
    // eslint-disable-next-line @typescript-eslint/dot-notation
    const isValid3: boolean = zkp['verifyEncryptionProof'](plaintext, ciphertext, invalidProof3);
    expect(isValid3).toBe(false);

    const invalidProof4: ZKProof = {
      commitment: [validProof.commitment[0], validProof.commitment[1]],
      challenge: validProof.challenge,
      response: (validProof.response + 1n) % publicKey.getPrimeQ(),
    };
    // eslint-disable-next-line @typescript-eslint/dot-notation
    const isValid4: boolean = zkp['verifyEncryptionProof'](plaintext, ciphertext, invalidProof4);
    expect(isValid4).toBe(false);
  });

  voturaTest(
    'verifyDisjunctiveEncryptionProof',
    ({ keyPair, plaintext, randomness, ciphertext }) => {
      const { publicKey } = keyPair;
      const plaintexts = [plaintext, 123123123n, 456456456n, 789789789n];
      const ciphertexts: Ciphertext[] = plaintexts.map((p) => publicKey.encrypt(p, randomness)[0]);
      expect(ciphertexts[0]).toBe(ciphertext);
      const realIndex = plaintexts.indexOf(plaintext);
      expect(realIndex).toBe(0n);

      const zkp = new ZeroKnowledgeProof(publicKey);
      const debug = new TestZKP(publicKey);
      console.warn(`--- starting creation ---`);
      const validProofs = debug.createDisjunctiveEncryptionProof(
        ciphertexts,
        realIndex,
        randomness,
      );
      console.warn(`--- ended creation - starting verification ---`);

      const isValid = debug.verifyDisjunctiveEncryptionProof(ciphertexts, validProofs);
      console.warn(`--- ended verification ---`);
      expect(isValid).toBe(true);

      const invalidProofs1: ZKProof[] = validProofs.map((proof, index) => ({
        commitment:
          index === 0
            ? [(proof.commitment[0] + 1n) % publicKey.getPrimeP(), proof.commitment[1]]
            : [proof.commitment[0], proof.commitment[1]],
        challenge: proof.challenge,
        response: proof.response,
      }));
      const isValid1 = zkp.verifyDisjunctiveEncryptionProof(ciphertexts, invalidProofs1);
      expect(isValid1).toBe(false);

      const invalidProofs2: ZKProof[] = validProofs.map((proof, index) => ({
        commitment:
          index === 1
            ? [proof.commitment[0], (proof.commitment[1] + 1n) % publicKey.getPrimeP()]
            : [proof.commitment[0], proof.commitment[1]],
        challenge: proof.challenge,
        response: proof.response,
      }));
      const isValid2 = zkp.verifyDisjunctiveEncryptionProof(ciphertexts, invalidProofs2);
      expect(isValid2).toBe(false);

      const invalidProofs3: ZKProof[] = validProofs.map((proof, index) => ({
        commitment: [proof.commitment[0], proof.commitment[1]],
        challenge: index === 2 ? (proof.challenge + 1n) % publicKey.getPrimeQ() : proof.challenge,
        response: proof.response,
      }));
      const isValid3 = zkp.verifyDisjunctiveEncryptionProof(ciphertexts, invalidProofs3);
      expect(isValid3).toBe(false);

      const invalidProofs4: ZKProof[] = validProofs.map((proof, index) => ({
        commitment: [proof.commitment[0], proof.commitment[1]],
        challenge: proof.challenge,
        response: index === 3 ? (proof.response + 1n) % publicKey.getPrimeQ() : proof.response,
      }));
      const isValid4 = zkp.verifyDisjunctiveEncryptionProof(ciphertexts, invalidProofs4);
      expect(isValid4).toBe(false);
    },
  );

  voturaTest('verifyDecryptionProof', ({ keyPair, plaintext, ciphertext }) => {
    const { publicKey } = keyPair;
    const validProof = keyPair.privateKey.createDecryptionProof(ciphertext);

    const zkp = new ZeroKnowledgeProof(publicKey);
    const isValid = zkp.verifyDecryptionProof(plaintext, ciphertext, validProof);
    expect(isValid).toBe(true);

    const invalidProof1: ZKProof = {
      commitment: [
        (validProof.commitment[0] + 1n) % publicKey.getPrimeP(),
        validProof.commitment[1],
      ],
      challenge: validProof.challenge,
      response: validProof.response,
    };
    const isValid1 = zkp.verifyDecryptionProof(plaintext, ciphertext, invalidProof1);
    expect(isValid1).toBe(false);

    const invalidProof2: ZKProof = {
      commitment: [
        validProof.commitment[0],
        (validProof.commitment[1] + 1n) % publicKey.getPrimeP(),
      ],
      challenge: validProof.challenge,
      response: validProof.response,
    };
    const isValid2 = zkp.verifyDecryptionProof(plaintext, ciphertext, invalidProof2);
    expect(isValid2).toBe(false);

    const invalidProof3: ZKProof = {
      commitment: [validProof.commitment[0], validProof.commitment[1]],
      challenge: (validProof.challenge + 1n) % publicKey.getPrimeQ(),
      response: validProof.response,
    };
    const isValid3 = zkp.verifyDecryptionProof(plaintext, ciphertext, invalidProof3);
    expect(isValid3).toBe(false);

    const invalidProof4: ZKProof = {
      commitment: [validProof.commitment[0], validProof.commitment[1]],
      challenge: validProof.challenge,
      response: (validProof.response + 1n) % publicKey.getPrimeQ(),
    };
    const isValid4 = zkp.verifyDecryptionProof(plaintext, ciphertext, invalidProof4);
    expect(isValid4).toBe(false);
  });
});

class TestZKP {
  private readonly pk: PublicKey;

  public constructor(pk: PublicKey) {
    this.pk = pk;
  }

  createDisjunctiveEncryptionProof(
    ciphertexts: Ciphertext[],
    realIndex: number,
    randomness: bigint,
  ): ZKProof[] {
    if (realIndex < 0 || realIndex >= ciphertexts.length) {
      throw new Error('DEBUG: realIndex is out of bounds');
    }

    const disjunctiveZKPs: ZKProof[] = [];

    ciphertexts.forEach((ciphertext, index) => {
      const choice = 1n; // = modPow(this.pk.generator, 0);
      if (index !== realIndex) {
        if (!ciphertext) {
          console.warn(`guard: this should never happen`);
        } else {
          console.warn(`simulate proof (index = ${index}, ciphertext: ${ciphertext})`);
        }
        const simulatedProof = this.createSimulatedEncryptionProof(choice, ciphertext);
        disjunctiveZKPs.push(simulatedProof);
      }
    });
    let tempString = `only simulated disjunctiveZKPs: `;
    disjunctiveZKPs.forEach((proof, index) => {
      tempString += `(index=${index}) A=${proof.commitment[0]}, B=${proof.commitment[1]} `;
    });
    console.warn(tempString);

    console.warn(`create real proof (index = ${realIndex})`);
    const realProof = this.createRealEncryptionProof(disjunctiveZKPs, realIndex, randomness);
    disjunctiveZKPs.splice(realIndex, 0, realProof);
    tempString = `now all disjunctiveZKPs: `;
    disjunctiveZKPs.forEach((proof, index) => {
      tempString += `(index=${index}) A=${proof.commitment[0]}, B=${proof.commitment[1]} `;
    });
    console.warn(tempString);

    return disjunctiveZKPs;
  }

  private createSimulatedEncryptionProof(plaintext: bigint, ciphertext: Ciphertext): ZKProof {
    const challenge = randBetween(modAdd([this.pk.getPrimeQ(), -1n], this.pk.getPrimeQ()), 0n);
    const response = randBetween(modAdd([this.pk.getPrimeQ(), -1n], this.pk.getPrimeQ()), 0n);

    const inversePlaintext = modInv(plaintext, this.pk.getPrimeP());
    const betaOverPlaintext = modMultiply([ciphertext[1], inversePlaintext], this.pk.getPrimeP());

    const commitmentA = modMultiply(
      [
        modInv(modPow(ciphertext[0], challenge, this.pk.getPrimeP()), this.pk.getPrimeP()),
        modPow(this.pk.getGenerator(), response, this.pk.getPrimeP()),
      ],
      this.pk.getPrimeP(),
    );
    const commitmentB = modMultiply(
      [
        modInv(modPow(betaOverPlaintext, challenge, this.pk.getPrimeP()), this.pk.getPrimeP()),
        modPow(this.pk.getPublicKey(), response, this.pk.getPrimeP()),
      ],
      this.pk.getPrimeP(),
    );

    console.warn(`simulated commitmentA = ${commitmentA}, commitmentB = ${commitmentB}`);
    console.warn(`...for random challenge = ${challenge} and response = ${response}`);

    return {
      commitment: [commitmentA, commitmentB],
      challenge: challenge,
      response: response,
    };
  }

  private createRealEncryptionProof(
    simulatedZKPs: ZKProof[],
    realIndex: number,
    randomness: bigint,
  ): ZKProof {
    const w = randBetween(modAdd([this.pk.getPrimeQ(), -1n], this.pk.getPrimeQ()), 1n);

    const commitmentA = modPow(this.pk.getGenerator(), w, this.pk.getPrimeP());
    const commitmentB = modPow(this.pk.getPublicKey(), w, this.pk.getPrimeP());
    console.warn(`real commitmentA = ${commitmentA}, commitmentB = ${commitmentB}`);

    const partsToHash: string[] = [];

    for (let i = 0; i <= simulatedZKPs.length; i++) {
      if (i === realIndex) {
        console.warn(`push real commitments (index = ${i})`);
        partsToHash.push(commitmentA.toString());
        partsToHash.push(commitmentB.toString());
      }
      if (i < simulatedZKPs.length) {
        const proof = simulatedZKPs[i];
        if (!proof) {
          throw new Error(`DEBUG: Missing simulated proof at index ${i}`);
        }
        console.warn(`push simulated commitments (index = ${i})`);
        partsToHash.push(proof.commitment[0].toString());
        partsToHash.push(proof.commitment[1].toString());
      }
    }

    const disjunctiveChallenge = getFiatShamirChallenge(partsToHash, this.pk.getPrimeQ());
    console.warn(`therefore disjunctiveChallenge = ${disjunctiveChallenge}`);

    let realChallenge = disjunctiveChallenge;
    simulatedZKPs.forEach((proof, index) => {
      if (index !== realIndex) {
        realChallenge =
          modAdd([realChallenge, -proof.challenge], this.pk.getPrimeQ()) % this.pk.getPrimeQ();
      }
    });
    console.warn(`this gives a realChallenge = ${realChallenge}`);

    const response = modAdd(
      [w, modMultiply([randomness, realChallenge], this.pk.getPrimeQ())],
      this.pk.getPrimeQ(),
    );
    console.warn(`...and a response = ${response}`);

    return {
      commitment: [commitmentA, commitmentB],
      challenge: realChallenge,
      response: response,
    };
  }

  verifyDisjunctiveEncryptionProof(ciphertexts: Ciphertext[], zkProofs: ZKProof[]): boolean {
    if (ciphertexts.length !== zkProofs.length) {
      console.warn(
        `DEBUG: Bad number of proofs (expected ${ciphertexts.length}, found ${zkProofs.length})`,
      );
      return false;
    }

    ciphertexts.forEach((ciphertext, index) => {
      const choice0 = 1n; // = modPow(this.pk.generator, 0);
      const choice1 = this.pk.getGenerator(); // = modPow(this.pk.generator, 1);
      const zkProof = zkProofs[index];
      if (zkProof === undefined) {
        console.warn(`DEBUG: Invalid input: zkProof[${index}] is undefined`);
        return false;
      }
      console.warn(`encrypted a simulated proof?`);
      const isValid0 = this.verifyEncryptionProof(choice0, ciphertext, zkProof);
      console.warn(`==> encrypted a simulated proof: ${isValid0}`);
      console.warn(`encrypted a real proof?`);
      const isValid1 = this.verifyEncryptionProof(choice1, ciphertext, zkProof);
      console.warn(`==> encrypted a real proof: ${isValid1}`);
      if (!isValid0 && !isValid1) {
        // eslint-disable-next-line @typescript-eslint/restrict-template-expressions,@typescript-eslint/no-base-to-string
        console.warn(`DEBUG: Bad proof at index ${index}: ${ciphertext} with proof ${zkProof}`);
        return false;
      }
    });

    const partsToHash: string[] = [];

    zkProofs.forEach((proof) => {
      partsToHash.push(proof.commitment[0].toString());
      partsToHash.push(proof.commitment[1].toString());
    });

    const expectedChallenge = getFiatShamirChallenge(partsToHash, this.pk.getPrimeQ());

    const actualChallenge = zkProofs.reduce(
      (sum, proof) => modAdd([sum, proof.challenge], this.pk.getPrimeQ()),
      0n,
    );

    if (expectedChallenge !== actualChallenge) {
      console.warn(
        `DEBUG: Bad challenge (expected: ${expectedChallenge}, found: ${actualChallenge})`,
      );
      return false;
    }

    return true;
  }

  private verifyEncryptionProof(
    plaintext: bigint,
    ciphertext: Ciphertext,
    zkProof: ZKProof,
  ): boolean {
    if (
      modPow(zkProof.commitment[0], this.pk.getPrimeQ(), this.pk.getPrimeP()) !== 1n ||
      modPow(zkProof.commitment[1], this.pk.getPrimeQ(), this.pk.getPrimeP()) !== 1n
    ) {
      console.warn(`DEBUG: Invalid commitment in proof: A or B not in the correct group!`);
      return false;
    }
    console.warn(
      `proof with commitmentA = ${zkProof.commitment[0]}, commitmentB = ${zkProof.commitment[1]}`,
    );
    console.warn(
      `...and random challenge = ${zkProof.challenge} and response = ${zkProof.response}`,
    );
    if (!ciphertext) {
      console.warn(`guard: this should never happen`);
    } else {
      console.warn(`...is correct for ciphertext = ${ciphertext} ?`);
    }

    const check1a = modPow(this.pk.getGenerator(), zkProof.response, this.pk.getPrimeP());
    const check1b = modMultiply(
      [modPow(ciphertext[0], zkProof.challenge, this.pk.getPrimeP()), zkProof.commitment[0]],
      this.pk.getPrimeP(),
    );

    if (check1a !== check1b) {
      console.warn(
        `DEBUG: First verification check failed: g^response != commitmentA * alpha^challenge!`,
      );
      console.warn(`checkA = ${check1a} vs. checkB = ${check1b}`);
      return false;
    }

    const inversePlaintext = modInv(plaintext, this.pk.getPrimeP());
    const betaOverPlaintext = modMultiply([ciphertext[1], inversePlaintext], this.pk.getPrimeP());

    const check2a = modPow(this.pk.getPublicKey(), zkProof.response, this.pk.getPrimeP());
    const check2b = modMultiply(
      [modPow(betaOverPlaintext, zkProof.challenge, this.pk.getPrimeP()), zkProof.commitment[1]],
      this.pk.getPrimeP(),
    );

    if (check2a !== check2b) {
      console.warn(
        `DEBUG: Second verification check failed: y^response != commitmentB * (beta/m)^challenge!`,
      );
      console.warn(`checkA = ${check2a} vs. checkB = ${check2b}`);
      return false;
    }

    return true;
  }
}
