import {
  isProbablyPrime,
  modAdd,
  modInv,
  modMultiply,
  modPow,
  prime,
  randBetween,
} from 'bigint-crypto-utils';
import { getFiatShamirChallenge, getGeneratorForPrimes } from './utils.js';

export * from './utils.js';

export type Ciphertext = [bigint, bigint];

export interface ZKProof {
  commitment: [bigint, bigint];
  challenge: bigint;
  response: bigint;
}

export class PublicKey {
  protected readonly primeP: bigint;
  protected readonly primeQ: bigint;
  protected readonly generator: bigint;
  protected readonly publicKey: bigint;

  public constructor(primeP: bigint, primeQ: bigint, generator: bigint, publicKey: bigint) {
    this.primeP = primeP;
    this.primeQ = primeQ;
    this.generator = generator;
    this.publicKey = publicKey;
  }

  /**
   * Encrypts the given encoded plaintext using the public key.
   * An encoded plaintext is generator ^ (number of votes) mod primeP.
   * @param encodedPlaintext The encoded plaintext to encrypt, must be in the range [1, primeP - 1]
   * @param randomness Optional randomness to use for encryption, must be in the range [1, primeP - 2]. If not provided, a random value will be generated.
   * @returns The ciphertext and the randomness used for encryption.
   */
  public encrypt(
    encodedPlaintext: bigint,
    randomness: bigint = randBetween(modAdd([this.primeP, -1n], this.primeP), 1n),
  ): [Ciphertext, bigint] {
    if (encodedPlaintext === 0n) {
      throw Error('Cannot encrypt 0 with El Gamal!');
    }

    if (encodedPlaintext <= 0n || encodedPlaintext >= this.primeP) {
      throw Error('Message out of range for El Gamal encoding!');
    }

    const alpha = modPow(this.generator, randomness, this.primeP);
    const beta = modMultiply(
      [encodedPlaintext, modPow(this.publicKey, randomness, this.primeP)],
      this.primeP,
    );

    return [[alpha, beta], randomness];
  }

  public getPrimeP(): bigint {
    return this.primeP;
  }

  public getPrimeQ(): bigint {
    return this.primeQ;
  }

  public getGenerator(): bigint {
    return this.generator;
  }

  public getPublicKey(): bigint {
    return this.publicKey;
  }
}

export class PrivateKey extends PublicKey {
  private readonly privateKey: bigint;

  public constructor(
    primeP: bigint,
    primeQ: bigint,
    generator: bigint,
    publicKey: bigint,
    privateKey: bigint,
  ) {
    super(primeP, primeQ, generator, publicKey);
    this.privateKey = privateKey;
  }

  /**
   * Decrypts the given ciphertext using the private key.
   * The returned value is an encoded plaintext, which is generator ^ (number of votes) mod primeP.
   * @param ciphertext
   * @returns The encoded plaintext (generator ^ (number of votes) mod primeP)
   */
  public decrypt(ciphertext: Ciphertext): bigint {
    return modMultiply(
      [
        modPow(ciphertext[0], modAdd([this.primeQ, -this.privateKey], this.primeP), this.primeP),
        ciphertext[1],
      ],
      this.primeP,
    );
  }

  /**
   * Creates a zero-knowledge proof for the decryption of the given ciphertext.
   * @param ciphertext The ciphertext to create a proof for.
   * @returns The zero-knowledge proof.
   */
  public createDecryptionProof(ciphertext: Ciphertext): ZKProof {
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

  public getPrivateKey(): bigint {
    return this.privateKey;
  }
}

export class KeyPair {
  public publicKey: PublicKey;

  public privateKey: PrivateKey;

  public constructor(
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

export const getKeyPair = async (bitsPrimeP = 2048): Promise<KeyPair> => {
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
  private readonly pk: PublicKey;

  public constructor(pk: PublicKey) {
    this.pk = pk;
  }

  /**
   * Aggregates multiple votes (each being an array of ciphertexts) into a single aggregated vote (array of ciphertexts). The arrays must all be in the same order of corresponding candidates and of the same length.
   * @param votes The votes to aggregate.
   * @returns The aggregated votes per candidate, in the same order as the input votes.
   */
  public aggregateVotes(votes: Ciphertext[][]): Ciphertext[] {
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

  private aggregateCiphertexts(ciphertexts: Ciphertext[]): Ciphertext {
    return ciphertexts.reduce(
      ([alpha, beta], [a, b]) => [
        modMultiply([alpha, a], this.pk.getPrimeP()),
        modMultiply([beta, b], this.pk.getPrimeP()),
      ],
      [1n, 1n],
    );
  }
}

export class ZeroKnowledgeProof {
  private readonly pk: PublicKey;

  public constructor(pk: PublicKey) {
    this.pk = pk;
  }

  public createDisjunctiveEncryptionProof(
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

  public verifyDisjunctiveEncryptionProof(ciphertexts: Ciphertext[], zkProofs: ZKProof[]): boolean {
    if (ciphertexts.length !== zkProofs.length) {
      console.warn(
        `Bad number of proofs (expected ${ciphertexts.length}, found ${zkProofs.length})`,
      );
      return false;
    }

    ciphertexts.forEach((ciphertext, index) => {
      const choice0 = 1n; // = modPow(this.pk.generator, 0);
      const choice1 = this.pk.getGenerator(); // = modPow(this.pk.generator, 1);
      const zkProof = zkProofs[index];
      if (zkProof === undefined) {
        console.warn(`Invalid input: zkProof[${index}] is undefined`);
        return false;
      }
      const isValid0 = this.verifyEncryptionProof(choice0, ciphertext, zkProof);
      const isValid1 = this.verifyEncryptionProof(choice1, ciphertext, zkProof);
      if (!isValid0 && !isValid1) {
        // eslint-disable-next-line @typescript-eslint/restrict-template-expressions,@typescript-eslint/no-base-to-string
        console.warn(`Bad proof at index ${index}: ${ciphertext} with proof ${zkProof}`);
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
      console.warn(`Bad challenge (expected: ${expectedChallenge}, found: ${actualChallenge})`);
      return false;
    }

    return true;
  }

  public verifyDecryptionProof(
    plaintext: bigint,
    ciphertext: Ciphertext,
    zkProof: ZKProof,
  ): boolean {
    const partsToHash: string[] = [];
    partsToHash.push(zkProof.commitment[0].toString());
    partsToHash.push(zkProof.commitment[1].toString());
    const recomputedChallenge = getFiatShamirChallenge(partsToHash, this.pk.getPrimeQ());

    if (recomputedChallenge !== zkProof.challenge) {
      console.warn(`Bad challenge (expected ${recomputedChallenge}, found ${zkProof.challenge})`);
      return false;
    }

    const check1a = modPow(this.pk.getGenerator(), zkProof.response, this.pk.getPrimeP());
    const check1b = modMultiply(
      [
        modPow(this.pk.getPublicKey(), zkProof.challenge, this.pk.getPrimeP()),
        zkProof.commitment[0],
      ],
      this.pk.getPrimeP(),
    );

    if (check1a !== check1b) {
      console.warn(`First verification check failed: g^response != commitmentA * y^challenge!`);
      return false;
    }

    const inversePlaintext = modInv(plaintext, this.pk.getPrimeP());
    const betaOverPlaintext = modMultiply([ciphertext[1], inversePlaintext], this.pk.getPrimeP());

    const check2a = modPow(ciphertext[0], zkProof.response, this.pk.getPrimeP());
    const check2b = modMultiply(
      [modPow(betaOverPlaintext, zkProof.challenge, this.pk.getPrimeP()), zkProof.commitment[1]],
      this.pk.getPrimeP(),
    );

    if (check2a !== check2b) {
      console.warn(
        `Second verification check failed: alpha^response != commitmentB * (beta/m)^challenge!`,
      );
      return false;
    }

    return true;
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
    const w = randBetween(modAdd([this.pk.getPrimeQ(), -1n], this.pk.getPrimeQ()), 0n);

    const commitmentA = modPow(this.pk.getGenerator(), w, this.pk.getPrimeP());
    const commitmentB = modPow(this.pk.getPublicKey(), w, this.pk.getPrimeP());

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

    const disjunctiveChallenge = getFiatShamirChallenge(partsToHash, this.pk.getPrimeQ());

    let realChallenge = disjunctiveChallenge;
    simulatedZKPs.forEach((proof, index) => {
      if (index !== realIndex) {
        realChallenge =
          modAdd([realChallenge, -proof.challenge], this.pk.getPrimeQ()) % this.pk.getPrimeQ();
      }
    });

    const response = modAdd(
      [w, modMultiply([randomness, realChallenge], this.pk.getPrimeQ())],
      this.pk.getPrimeQ(),
    );

    return {
      commitment: [commitmentA, commitmentB],
      challenge: realChallenge,
      response: response,
    };
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
      console.warn(`Invalid commitment in proof: A or B not in the correct group!`);
      return false;
    }

    const check1a = modPow(this.pk.getGenerator(), zkProof.response, this.pk.getPrimeP());
    const check1b = modMultiply(
      [modPow(ciphertext[0], zkProof.challenge, this.pk.getPrimeP()), zkProof.commitment[0]],
      this.pk.getPrimeP(),
    );

    if (check1a !== check1b) {
      console.warn(`First verification check failed: g^response != commitmentA * alpha^challenge!`);
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
        `Second verification check failed: y^response != commitmentB * (beta/m)^challenge!`,
      );
      return false;
    }

    return true;
  }
}
