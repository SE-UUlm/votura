import { getGeneratorForPrimes } from './utils.js';
import { createHash } from 'crypto';
import {
  isProbablyPrime,
  modAdd,
  modInv,
  modMultiply,
  modPow,
  prime,
  randBetween
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
    randomness: bigint = randBetween(modAdd([this.primeP, -1n], this.primeP), 1n)
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
  
  reEncrypt(
    ciphertext: Ciphertext,
    newRandomness: bigint = randBetween(modAdd([this.primeP, -1n], this.primeP), 1n)
  ): [Ciphertext, bigint] {
    const newAlpha = modMultiply(
      [ciphertext[0], modPow(this.generator, newRandomness, this.primeP)],
      this.primeP,
    );

    const newBeta = modMultiply(
      [ciphertext[1], modPow(this.publicKey, newRandomness, this.primeP)],
      this.primeP,
    );

    return [[newAlpha, newBeta], newRandomness];
  }
}

export class PrivateKey extends PublicKey {
  privateKey: bigint;

  constructor(
    primeP: bigint,
    primeQ: bigint,
    generator: bigint,
    publicKey: bigint,
    privateKey: bigint
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
}

export class KeyPair {
  publicKey: PublicKey;
  privateKey: PrivateKey;

  constructor(
    primeP: bigint,
    primeQ: bigint,
    generator: bigint,
    publicKey: bigint,
    privateKey: bigint
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

export class DisjunctiveEncryptionZKP {
  constructor(private readonly pk: PublicKey) {}

  createSimulatedEncryptionProof(
    plaintext: bigint,
    ciphertext: Ciphertext
  ): ZKProof {
    const challenge = randBetween(0n, this.pk.primeQ - 1n);
    const response = randBetween(0n, this.pk.primeQ - 1n);

    const inversePlaintext = modInv(plaintext, this.pk.primeP);
    const betaOverPlaintext = modMultiply(
      [ciphertext[1], inversePlaintext],
      this.pk.primeP
    );

    const commitmentA = modMultiply(
      [modPow(ciphertext[0], -challenge, this.pk.primeP), modPow(this.pk.generator, response, this.pk.primeP)],
      this.pk.primeP
    );
    const commitmentB = modMultiply(
      [modPow(betaOverPlaintext, -challenge, this.pk.primeP), modPow(this.pk.publicKey, response, this.pk.primeP)],
      this.pk.primeP
    );

    return {
      commitment: [commitmentA, commitmentB],
      challenge: challenge,
      response: response
    };
  }

  createRealEncryptionProof(
    simulatedZKPs: ZKProof[],
    realIndex: number,
    randomness: bigint
  ): ZKProof {
    const w = randBetween(0n, this.pk.primeQ - 1n);

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

    const stringToHash = partsToHash.join(',');
    const hash = createHash('sha256');
    hash.update(stringToHash);
    const hashHex = hash.digest('hex');

    const disjunctiveChallenge = BigInt('0x' + hashHex) % this.pk.primeQ;

    let realChallenge = disjunctiveChallenge;
    simulatedZKPs.forEach((proof, index) => {
      if (index !== realIndex) {
        realChallenge = (realChallenge - proof.challenge + this.pk.primeQ) % this.pk.primeQ;
      }
    });

    const response = (w + modMultiply([randomness, realChallenge], this.pk.primeQ)) % this.pk.primeQ;

    return {
      commitment: [commitmentA, commitmentB],
      challenge: realChallenge,
      response: response
    };
  }

  createDisjunctiveEncryptionProof(
    choices: bigint[],
    ciphertexts: Ciphertext[],
    realIndex: number,
    randomness: bigint
  ): ZKProof[] {
    if (realIndex < 0 || realIndex >= choices.length) {
      throw new Error('realIndex is out of bounds');
    }
  
    const disjunctiveZKPs: ZKProof[] = [];
  
    for (let i = 0; i < choices.length; i++) {
      if (i !== realIndex) {
        const simulatedProof = this.createSimulatedEncryptionProof(choices[i], ciphertexts[i]);
        disjunctiveZKPs.push(simulatedProof);
      }
    }
  
    const realProof = this.createRealEncryptionProof(disjunctiveZKPs, realIndex, randomness);
    disjunctiveZKPs.splice(realIndex, 0, realProof);
  
    return disjunctiveZKPs;
  }

  verifyEncryptionProof(
    plaintext: bigint,
    ciphertext: Ciphertext,
    zkProof: ZKProof
  ): boolean {
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
      this.pk.primeP
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
      this.pk.primeP
    );

    if (check2a !== check2b) {
      console.warn(`Second verification check failed: y^response != commitmentB * (beta/m)^challenge!`);
      return false;
    }

    return true;
  }

  verifyDisjunctiveEncryptionProof(
    choices: bigint[],
    ciphertexts: Ciphertext[],
    zkProofs: ZKProof[]
  ): boolean {
    if (ciphertexts.length !== zkProofs.length) {
      console.warn(`Bad number of proofs (expected ${ciphertexts.length}, found ${zkProofs.length})`);
      return false;
    }

    for (let i = 0; i < ciphertexts.length; i++) {
      const isValid = this.verifyEncryptionProof(choices[i], ciphertexts[i], zkProofs[i]);
      if (!isValid) {
        console.warn(`Bad proof at index ${i}: ${ciphertexts[i]} with proof ${zkProofs[i]}`);
        return false;
      }
    }
  
    const partsToHash: string[] = [];

    zkProofs.forEach(proof => {
      partsToHash.push(proof.commitment[0].toString());
      partsToHash.push(proof.commitment[1].toString());
    });
  
    const stringToHash = partsToHash.join(',');
    const hash = createHash('sha256');
    hash.update(stringToHash);
    const hashHex = hash.digest('hex');

    const expectedChallenge = BigInt('0x' + hashHex) % this.pk.primeQ;

    const actualChallenge = zkProofs.reduce(
      (sum, proof) => (sum + proof.challenge) % this.pk.primeQ,
      0n
    );

    if (expectedChallenge !== actualChallenge) {
      console.warn(`Bad challenge (expected: ${expectedChallenge}, found: ${actualChallenge})`);
      return false;
    }
  
    return true;
  }
}
