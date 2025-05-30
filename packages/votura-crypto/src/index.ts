import { getFiatShamirChallenge, getGeneratorForPrimes } from './utils.js';
import {
  isProbablyPrime,
  modAdd,
  modInv,
  modMultiply,
  modPow,
  prime,
  randBetween,
} from 'bigint-crypto-utils';

export * from './utils.js';

export type Ciphertext = [bigint, bigint];
export interface ZKProof {
  commitment: [bigint, bigint];
  challenge: bigint;
  response: bigint;
}

export class PublicKey {
  primeP: bigint;
  primeQ: bigint;
  generator: bigint;
  publicKey: bigint;

  constructor(primeP: bigint, primeQ: bigint, generator: bigint, publicKey: bigint) {
    this.primeP = primeP;
    this.primeQ = primeQ;
    this.generator = generator;
    this.publicKey = publicKey;
  }

  encrypt(
    plaintext: bigint,
    randomness: bigint = randBetween(modAdd([this.primeP, -1n], this.primeP), 1n),
  ): [Ciphertext, bigint] {
    if (plaintext === 0n) {
      throw Error('Cannot encrypt 0 with El Gamal!');
    }

    if (plaintext <= 0n || plaintext >= this.primeP) {
      throw Error('Message out of range for El Gamal encoding!');
    }

    const alpha = modPow(this.generator, randomness, this.primeP);
    const beta = modMultiply(
      [plaintext, modPow(this.publicKey, randomness, this.primeP)],
      this.primeP,
    );

    return [[alpha, beta], randomness];
  }
}

export class PrivateKey extends PublicKey {
  privateKey: bigint;

  constructor(
    primeP: bigint,
    primeQ: bigint,
    generator: bigint,
    publicKey: bigint,
    privateKey: bigint,
  ) {
    super(primeP, primeQ, generator, publicKey);
    this.privateKey = privateKey;
  }

  decrypt(ciphertext: Ciphertext): bigint {
    return modMultiply(
      [
        modPow(ciphertext[0], modAdd([this.primeQ, -this.privateKey], this.primeP), this.primeP),
        ciphertext[1],
      ],
      this.primeP,
    );
  }

  createDecryptionProof(ciphertext: Ciphertext): ZKProof {
    const w = randBetween(modAdd([this.primeQ, -1n], this.primeQ), 0n);

    const commitmentA = modPow(this.generator, w, this.primeP);
    const commitmentB = modPow(ciphertext[0], w, this.primeP);

    const partsToHash: string[] = [];
    partsToHash.push(commitmentA.toString());
    partsToHash.push(commitmentB.toString());

    const challenge = getFiatShamirChallenge(partsToHash, this.primeQ);

    const response = modAdd(
      [w, modMultiply([challenge, this.privateKey], this.primeQ)],
      this.primeQ,
    );

    return {
      commitment: [commitmentA, commitmentB],
      challenge: challenge,
      response: response,
    };
  }
}

export class KeyPair {
  publicKey: PublicKey;
  privateKey: PrivateKey;

  constructor(
    primeP: bigint,
    primeQ: bigint,
    generator: bigint,
    publicKey: bigint,
    privateKey: bigint,
  ) {
    if ((primeP - 1n) % primeQ !== 0n) {
      throw new Error('Invalid: (p - 1) is not divisible by q');
    }

    this.privateKey = new PrivateKey(primeP, primeQ, generator, publicKey, privateKey);
    this.publicKey = new PublicKey(primeP, primeQ, generator, publicKey);
  }
}

export const getKeyPair = async (bitsPrimeP: number = 2048): Promise<KeyPair> => {
  let primeP = await prime(bitsPrimeP);
  let probablePrimeQ = modMultiply([modAdd([primeP, -1n], primeP), modInv(2n, primeP)], primeP);

  let result = await isProbablyPrime(probablePrimeQ);

  while (!result) {
    primeP = await prime(bitsPrimeP);
    probablePrimeQ = modMultiply([modAdd([primeP, -1n], primeP), modInv(2n, primeP)], primeP);
    result = await isProbablyPrime(probablePrimeQ);
  }

  const generator = getGeneratorForPrimes(primeP, probablePrimeQ);
  const privateKey = randBetween(primeP, 1n);
  const publicKey = modPow(generator, privateKey, primeP);

  return new KeyPair(primeP, probablePrimeQ, generator, publicKey, privateKey);
};

export class Tallying {
  constructor(private readonly pk: PublicKey) {}

  aggregateCiphertexts(ciphertexts: Ciphertext[]): Ciphertext {
    return ciphertexts.reduce(
      ([alpha, beta], [a, b]) => [
        modMultiply([alpha, a], this.pk.primeP),
        modMultiply([beta, b], this.pk.primeP),
      ],
      [1n, 1n],
    );
  }

  aggregateVotes(votes: Ciphertext[][]): Ciphertext[] {
    const aggregated: Ciphertext[] = [];

    const voteCount = votes.length;
    if (voteCount === 0) {
      throw new Error(`Aggregating zero votes.`);
    }
    if (votes[0] === undefined) {
      throw new Error(`Invalid vote (index 0): is undefined.`);
    }

    const choiceCount = votes[0].length;
    for (let i = 0; i < choiceCount; i++) {
      const ciphertextsForChoiceI: Ciphertext[] = [];

      for (let j = 0; j < voteCount; j++) {
        const vote = votes[j];
        if (vote === undefined) {
          throw new Error(`Invalid vote (index ${j}): is undefined.`);
        }
        if (vote.length !== choiceCount) {
          throw new Error(
            `Invalid vote (index ${j}): expected ${choiceCount} choices, found ${vote.length}`,
          );
        }

        const ciphertext = vote[i];
        if (ciphertext === undefined) {
          throw new Error(`Invalid vote (index ${j}): ciphertext of choice ${i} is undefined.`);
        }

        ciphertextsForChoiceI.push(ciphertext);
      }
      aggregated.push(this.aggregateCiphertexts(ciphertextsForChoiceI));
    }

    return aggregated;
  }
}

export class ZeroKnowledgeProof {
  constructor(private readonly pk: PublicKey) {}

  createSimulatedEncryptionProof(plaintext: bigint, ciphertext: Ciphertext): ZKProof {
    const challenge = randBetween(modAdd([this.pk.primeQ, -1n], this.pk.primeQ), 0n);
    const response = randBetween(modAdd([this.pk.primeQ, -1n], this.pk.primeQ), 0n);

    const inversePlaintext = modInv(plaintext, this.pk.primeP);
    const betaOverPlaintext = modMultiply([ciphertext[1], inversePlaintext], this.pk.primeP);

    const commitmentA = modMultiply(
      [
        modInv(modPow(ciphertext[0], challenge, this.pk.primeP), this.pk.primeP),
        modPow(this.pk.generator, response, this.pk.primeP),
      ],
      this.pk.primeP,
    );
    const commitmentB = modMultiply(
      [
        modInv(modPow(betaOverPlaintext, challenge, this.pk.primeP), this.pk.primeP),
        modPow(this.pk.publicKey, response, this.pk.primeP),
      ],
      this.pk.primeP,
    );

    return {
      commitment: [commitmentA, commitmentB],
      challenge: challenge,
      response: response,
    };
  }

  createRealEncryptionProof(
    simulatedZKPs: ZKProof[],
    realIndex: number,
    randomness: bigint,
  ): ZKProof {
    const w = randBetween(modAdd([this.pk.primeQ, -1n], this.pk.primeQ), 0n);

    const commitmentA = modPow(this.pk.generator, w, this.pk.primeP);
    const commitmentB = modPow(this.pk.publicKey, w, this.pk.primeP);

    const partsToHash: string[] = [];

    simulatedZKPs.forEach((proof, index) => {
      if (index === realIndex) {
        partsToHash.push(commitmentA.toString());
        partsToHash.push(commitmentB.toString());
      } else {
        partsToHash.push(proof.commitment[0].toString());
        partsToHash.push(proof.commitment[1].toString());
      }
    });

    const disjunctiveChallenge = getFiatShamirChallenge(partsToHash, this.pk.primeQ);

    let realChallenge = disjunctiveChallenge;
    simulatedZKPs.forEach((proof, index) => {
      if (index !== realIndex) {
        realChallenge = modAdd([realChallenge, -proof.challenge], this.pk.primeQ) % this.pk.primeQ;
      }
    });

    const response = modAdd(
      [w, modMultiply([randomness, realChallenge], this.pk.primeQ)],
      this.pk.primeQ,
    );

    return {
      commitment: [commitmentA, commitmentB],
      challenge: realChallenge,
      response: response,
    };
  }

  createDisjunctiveEncryptionProof(
    ciphertexts: Ciphertext[],
    realIndex: number,
    randomness: bigint,
  ): ZKProof[] {
    if (realIndex < 0 || realIndex >= ciphertexts.length) {
      throw new Error('realIndex is out of bounds');
    }

    const disjunctiveZKPs: ZKProof[] = [];

    ciphertexts.forEach((ciphertext, index) => {
      const choice = 1n; // = modPow(this.pk.generator, 0);
      if (index !== realIndex) {
        const simulatedProof = this.createSimulatedEncryptionProof(choice, ciphertext);
        disjunctiveZKPs.push(simulatedProof);
      }
    });

    const realProof = this.createRealEncryptionProof(disjunctiveZKPs, realIndex, randomness);
    disjunctiveZKPs.splice(realIndex, 0, realProof);

    return disjunctiveZKPs;
  }

  verifyEncryptionProof(plaintext: bigint, ciphertext: Ciphertext, zkProof: ZKProof): boolean {
    if (
      modPow(zkProof.commitment[0], this.pk.primeQ, this.pk.primeP) !== 1n ||
      modPow(zkProof.commitment[1], this.pk.primeQ, this.pk.primeP) !== 1n
    ) {
      console.warn(`Invalid commitment in proof: A or B not in the correct group!`);
      return false;
    }

    const check1a = modPow(this.pk.generator, zkProof.response, this.pk.primeP);
    const check1b = modMultiply(
      [modPow(ciphertext[0], zkProof.challenge, this.pk.primeP), zkProof.commitment[0]],
      this.pk.primeP,
    );

    if (check1a !== check1b) {
      console.warn(`First verification check failed: g^response != commitmentA * alpha^challenge!`);
      return false;
    }

    const inversePlaintext = modInv(plaintext, this.pk.primeP);
    const betaOverPlaintext = modMultiply([ciphertext[1], inversePlaintext], this.pk.primeP);

    const check2a = modPow(this.pk.publicKey, zkProof.response, this.pk.primeP);
    const check2b = modMultiply(
      [modPow(betaOverPlaintext, zkProof.challenge, this.pk.primeP), zkProof.commitment[1]],
      this.pk.primeP,
    );

    if (check2a !== check2b) {
      console.warn(
        `Second verification check failed: y^response != commitmentB * (beta/m)^challenge!`,
      );
      return false;
    }

    return true;
  }

  verifyDisjunctiveEncryptionProof(ciphertexts: Ciphertext[], zkProofs: ZKProof[]): boolean {
    if (ciphertexts.length !== zkProofs.length) {
      console.warn(
        `Bad number of proofs (expected ${ciphertexts.length}, found ${zkProofs.length})`,
      );
      return false;
    }

    ciphertexts.forEach((ciphertext, index) => {
      const choice0 = 1n; // = modPow(this.pk.generator, 0);
      const choice1 = this.pk.generator; // = modPow(this.pk.generator, 1);
      const zkProof = zkProofs[index];
      if (zkProof === undefined) {
        console.warn(`Invalid input: zkProof[${index}] is undefined`);
        return false;
      }
      const isValid0 = this.verifyEncryptionProof(choice0, ciphertext, zkProof);
      const isValid1 = this.verifyEncryptionProof(choice1, ciphertext, zkProof);
      if (!isValid0 && !isValid1) {
        console.warn(`Bad proof at index ${index}: ${ciphertext} with proof ${zkProof}`);
        return false;
      }
    });

    const partsToHash: string[] = [];

    zkProofs.forEach((proof) => {
      partsToHash.push(proof.commitment[0].toString());
      partsToHash.push(proof.commitment[1].toString());
    });

    const expectedChallenge = getFiatShamirChallenge(partsToHash, this.pk.primeQ);

    const actualChallenge = zkProofs.reduce(
      (sum, proof) => modAdd([sum, proof.challenge], this.pk.primeQ),
      0n,
    );

    if (expectedChallenge !== actualChallenge) {
      console.warn(`Bad challenge (expected: ${expectedChallenge}, found: ${actualChallenge})`);
      return false;
    }

    return true;
  }

  verifyDecryptionProof(plaintext: bigint, ciphertext: Ciphertext, zkProof: ZKProof): boolean {
    const partsToHash: string[] = [];
    partsToHash.push(zkProof.commitment[0].toString());
    partsToHash.push(zkProof.commitment[1].toString());
    const recomputedChallenge = getFiatShamirChallenge(partsToHash, this.pk.primeQ);

    if (recomputedChallenge !== zkProof.challenge) {
      console.warn(`Bad challenge (expected ${recomputedChallenge}, found ${zkProof.challenge})`);
      return false;
    }

    const check1a = modPow(this.pk.generator, zkProof.response, this.pk.primeP);
    const check1b = modMultiply(
      [modPow(this.pk.publicKey, zkProof.challenge, this.pk.primeP), zkProof.commitment[0]],
      this.pk.primeP,
    );

    if (check1a !== check1b) {
      console.warn(`First verification check failed: g^response != commitmentA * y^challenge!`);
      return false;
    }

    const inversePlaintext = modInv(plaintext, this.pk.primeP);
    const betaOverPlaintext = modMultiply([ciphertext[1], inversePlaintext], this.pk.primeP);

    const check2a = modPow(ciphertext[0], zkProof.response, this.pk.primeP);
    const check2b = modMultiply(
      [modPow(betaOverPlaintext, zkProof.challenge, this.pk.primeP), zkProof.commitment[1]],
      this.pk.primeP,
    );

    if (check2a !== check2b) {
      console.warn(
        `Second verification check failed: alpha^response != commitmentB * (beta/m)^challenge!`,
      );
      return false;
    }

    return true;
  }
}
