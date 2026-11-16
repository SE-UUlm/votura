import {
  isProbablyPrime,
  modAdd,
  modInv,
  modMultiply,
  modPow,
  prime,
  primeSync,
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

/**
 * Proof that a ciphertext encrypts 0 or 1.
 * The first sub-proof is for 0, the second for 1. Only the sub-proof for the actual plaintext is real.
 */
export type ZeroOrOneProof = [ZKProof, ZKProof];

/**
 * Proof that a vote is valid: every cell encrypts 0 or 1 and all cells together encrypt exactly 1.
 */
export interface VoteProof {
  /** One proof per cell, in the same order as the ciphertexts. */
  cellProofs: ZeroOrOneProof[];

  /** Proof that the product of all cells encrypts 1. */
  overallProof: ZKProof;
}

/**
 * Multiplies the given ciphertexts component-wise.
 * The result encrypts the sum of the votes of all given ciphertexts.
 */
export const multiplyCiphertexts = (ciphertexts: Ciphertext[], primeP: bigint): Ciphertext =>
  ciphertexts.reduce(
    ([alpha, beta], [a, b]) => [modMultiply([alpha, a], primeP), modMultiply([beta, b], primeP)],
    [1n, 1n],
  );

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
   * @param randomness The randomness to use for encryption, must be in the range [1, primeQ - 2]. If not provided, a random value will be generated.
   * @returns The ciphertext and the randomness used for encryption.
   */
  public encrypt(
    encodedPlaintext: bigint,
    randomness: bigint = randBetween(modAdd([this.primeQ, -1n], this.primeQ), 1n),
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
        modPow(ciphertext[0], modAdd([this.primeQ, -this.privateKey], this.primeQ), this.primeP),
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
    const w = randBetween(modAdd([this.primeQ, -1n], this.primeQ), 1n);

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

/**
 * Up to this size of p the key pair is generated on the calling thread.
 * In Node, prime() and isProbablyPrime() of bigint-crypto-utils start new worker threads on every
 * call. Finding a safe prime takes a random number of attempts, so for small keys the thread
 * startup dominates: with workers getKeyPair(20) took up to 7 s and getKeyPair(128) up to 42 s,
 * without them up to 0.1 s and 4 s. Sizes this small are only used by tests, real keys
 * (2048 bits) keep the workers so the backend event loop stays free.
 */
const MAX_BITS_PRIME_P_WITHOUT_WORKERS = 128;

export const getKeyPair = async (bitsPrimeP = 2048): Promise<KeyPair> => {
  const useWorkers = bitsPrimeP > MAX_BITS_PRIME_P_WITHOUT_WORKERS;
  const getPrimeQ = (p: bigint): bigint => modMultiply([modAdd([p, -1n], p), modInv(2n, p)], p);

  let primeP = useWorkers ? await prime(bitsPrimeP) : primeSync(bitsPrimeP);
  let probablePrimeQ = getPrimeQ(primeP);

  while (!(await isProbablyPrime(probablePrimeQ, 16, !useWorkers))) {
    primeP = useWorkers ? await prime(bitsPrimeP) : primeSync(bitsPrimeP);
    probablePrimeQ = getPrimeQ(primeP);
  }

  const generator = getGeneratorForPrimes(primeP, probablePrimeQ);
  const privateKey = randBetween(modAdd([probablePrimeQ, -1n], probablePrimeQ), 1n);
  const publicKey = modPow(generator, privateKey, primeP);

  return new KeyPair(primeP, probablePrimeQ, generator, publicKey, privateKey);
};

export class Tallying {
  private readonly pk: PublicKey | PrivateKey;

  public constructor(pk: PublicKey | PrivateKey) {
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
    return multiplyCiphertexts(ciphertexts, this.pk.getPrimeP());
  }
}

export class ZeroKnowledgeProof {
  private readonly pk: PublicKey | PrivateKey;

  public constructor(pk: PublicKey | PrivateKey) {
    this.pk = pk;
  }

  /**
   * Creates the proof that a vote is valid: every cell encrypts 0 or 1 and exactly one cell encrypts 1.
   * @param ciphertexts The encrypted cells of the vote.
   * @param realIndex The index of the cell that encrypts 1.
   * @param randomness The randomness used for each cell, in the same order as `ciphertexts`.
   * @returns One proof per cell and the proof that all cells together encrypt 1.
   */
  public createVoteProof(
    ciphertexts: Ciphertext[],
    realIndex: number,
    randomness: bigint[],
  ): VoteProof {
    if (realIndex < 0 || realIndex >= ciphertexts.length) {
      throw new Error('realIndex is out of bounds');
    }

    const cellProofs: ZeroOrOneProof[] = [];
    let overallRandomness = 0n;
    for (const [index, ciphertext] of ciphertexts.entries()) {
      const cellRandomness = randomness.find((_, i) => i === index);
      if (cellRandomness === undefined) {
        throw new Error(`Missing randomness for cell ${index}`);
      }
      cellProofs.push(this.createZeroOrOneProof(ciphertext, index === realIndex, cellRandomness));
      overallRandomness = modAdd([overallRandomness, cellRandomness], this.pk.getPrimeQ());
    }

    const overall = multiplyCiphertexts(ciphertexts, this.pk.getPrimeP());
    const nonce = this.getRandomExponent();
    const commitment = this.getRealCommitment(nonce);
    const challenge = this.getChallenge(overall, commitment);
    const overallProof = this.completeRealProof(commitment, nonce, overallRandomness, challenge);

    return { cellProofs, overallProof };
  }

  /**
   * Verifies that a vote is valid: every cell encrypts 0 or 1 and all cells together encrypt exactly 1.
   * @param ciphertexts The encrypted cells of the vote.
   * @param voteProof The proof created by createVoteProof.
   * @returns True if the proof is valid for the given ciphertexts.
   */
  public verifyVoteProof(ciphertexts: Ciphertext[], voteProof: VoteProof): boolean {
    if (ciphertexts.length === 0 || ciphertexts.length !== voteProof.cellProofs.length) {
      console.warn(
        `Bad number of cell proofs (expected ${ciphertexts.length}, found ${voteProof.cellProofs.length})`,
      );
      return false;
    }

    const allCellsValid = voteProof.cellProofs.every((cellProof, index) => {
      const ciphertext = ciphertexts.find((_, i) => i === index);
      return ciphertext !== undefined && this.verifyZeroOrOneProof(ciphertext, cellProof);
    });
    if (!allCellsValid) {
      return false;
    }

    const overall = multiplyCiphertexts(ciphertexts, this.pk.getPrimeP());
    const { overallProof } = voteProof;
    if (overallProof.challenge !== this.getChallenge(overall, overallProof.commitment)) {
      console.warn('Bad challenge in the overall proof');
      return false;
    }
    return this.verifyEncryptionProof(this.pk.getGenerator(), overall, overallProof);
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

  /**
   * Creates the proof that the ciphertext encrypts 0 or 1.
   * The sub-proof for the actual plaintext is real, the other one is simulated.
   */
  private createZeroOrOneProof(
    ciphertext: Ciphertext,
    isOne: boolean,
    randomness: bigint,
  ): ZeroOrOneProof {
    const nonce = this.getRandomExponent();
    const realCommitment = this.getRealCommitment(nonce);

    if (isOne) {
      const zeroProof = this.createSimulatedEncryptionProof(1n, ciphertext);
      const challenge = this.getChallenge(ciphertext, [...zeroProof.commitment, ...realCommitment]);
      const realChallenge = modAdd([challenge, -zeroProof.challenge], this.pk.getPrimeQ());
      return [zeroProof, this.completeRealProof(realCommitment, nonce, randomness, realChallenge)];
    }

    const oneProof = this.createSimulatedEncryptionProof(this.pk.getGenerator(), ciphertext);
    const challenge = this.getChallenge(ciphertext, [...realCommitment, ...oneProof.commitment]);
    const realChallenge = modAdd([challenge, -oneProof.challenge], this.pk.getPrimeQ());
    return [this.completeRealProof(realCommitment, nonce, randomness, realChallenge), oneProof];
  }

  /**
   * Verifies that the ciphertext encrypts 0 or 1.
   * Both sub-proofs must be valid and their challenges must add up to the Fiat-Shamir challenge.
   */
  private verifyZeroOrOneProof(ciphertext: Ciphertext, cellProof: ZeroOrOneProof): boolean {
    if (!this.isGroupElement(ciphertext[0]) || !this.isGroupElement(ciphertext[1])) {
      console.warn('Invalid ciphertext: alpha or beta not in the correct group!');
      return false;
    }

    const [zeroProof, oneProof] = cellProof;
    if (
      !this.verifyEncryptionProof(1n, ciphertext, zeroProof) ||
      !this.verifyEncryptionProof(this.pk.getGenerator(), ciphertext, oneProof)
    ) {
      return false;
    }

    const expectedChallenge = this.getChallenge(ciphertext, [
      ...zeroProof.commitment,
      ...oneProof.commitment,
    ]);
    const actualChallenge = modAdd([zeroProof.challenge, oneProof.challenge], this.pk.getPrimeQ());
    if (expectedChallenge !== actualChallenge) {
      console.warn(`Bad challenge (expected: ${expectedChallenge}, found: ${actualChallenge})`);
      return false;
    }

    return true;
  }

  /**
   * Fiat-Shamir challenge over the public key, the ciphertext and the commitments.
   * Including the public key and the ciphertext binds the proof to the statement it proves.
   */
  private getChallenge(ciphertext: Ciphertext, commitments: bigint[]): bigint {
    const parts = [
      this.pk.getPrimeP(),
      this.pk.getPrimeQ(),
      this.pk.getGenerator(),
      this.pk.getPublicKey(),
      ...ciphertext,
      ...commitments,
    ];
    return getFiatShamirChallenge(
      parts.map((part) => part.toString()),
      this.pk.getPrimeQ(),
    );
  }

  private getRandomExponent(): bigint {
    return randBetween(modAdd([this.pk.getPrimeQ(), -1n], this.pk.getPrimeQ()), 1n);
  }

  private getRealCommitment(nonce: bigint): [bigint, bigint] {
    return [
      modPow(this.pk.getGenerator(), nonce, this.pk.getPrimeP()),
      modPow(this.pk.getPublicKey(), nonce, this.pk.getPrimeP()),
    ];
  }

  private completeRealProof(
    commitment: [bigint, bigint],
    nonce: bigint,
    randomness: bigint,
    challenge: bigint,
  ): ZKProof {
    const response = modAdd(
      [nonce, modMultiply([randomness, challenge], this.pk.getPrimeQ())],
      this.pk.getPrimeQ(),
    );
    return { commitment, challenge, response };
  }

  private isGroupElement(value: bigint): boolean {
    return (
      value > 0n &&
      value < this.pk.getPrimeP() &&
      modPow(value, this.pk.getPrimeQ(), this.pk.getPrimeP()) === 1n
    );
  }
}
