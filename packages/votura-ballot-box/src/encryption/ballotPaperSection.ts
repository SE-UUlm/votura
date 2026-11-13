import type { PlainFilledBallotPaper } from '@repo/votura-validators';
import {
  ZeroKnowledgeProof,
  type Ciphertext,
  type PublicKey,
  type ZKProof,
} from '@votura/votura-crypto/index';
import { modPow } from 'bigint-crypto-utils';
import { extractCandidateIds } from '../utils.js';

export interface EncryptedSection {
  sectionId: string;
  votes: Record<
    string,
    {
      alpha: string;
      beta: string;
      commitment1: string;
      commitment2: string;
      challenge: string;
      response: string;
    }
  >[];
}
export interface AuditableVote {
  ciphertexts: Ciphertext[];

  /** Randomness used for each cell, in the same order as `ciphertexts`. */
  randomness: bigint[];
}

type SectionVotes = PlainFilledBallotPaper['sections'][string];
type VoteRecord = SectionVotes['votes'][number];
type EncryptedVote = EncryptedSection['votes'][number];

export class BallotPaperSectionEncryption {
  private readonly publicKey: PublicKey;

  private readonly zkProof: ZeroKnowledgeProof;

  public constructor(publicKey: PublicKey) {
    this.publicKey = publicKey;
    this.zkProof = new ZeroKnowledgeProof(publicKey);
  }

  /**
   * Encrypts a single ballot paper section and returns the encryption as EncryptedSection.
   * Expects that the ballot paper the section stems from has been validated using the zod plainBallotPaper schema.
   * Additionally returns an array of AuditableVotes needed for the auditing process.
   * @param section The ballot paper section to encrypt
   * @param sectionId The ID of the section being processed
   * @returns Encryption of a single ballot paper section, and all AuditableVotes for every vote
   */
  public encryptSection(
    section: SectionVotes,
    sectionId: string,
  ): [EncryptedSection, AuditableVote[]] {
    const encryptedVotes: EncryptedSection['votes'] = [];
    const auditableVotes: AuditableVote[] = [];

    const orderedCandidateIds = extractCandidateIds(section);
    for (const vote of section.votes) {
      const [ciphertexts, realIndex, randomness] = this.extractAndEncryptVotes(
        vote,
        orderedCandidateIds,
      );
      const chosenRandomness = randomness.find((_, index) => index === realIndex);
      if (chosenRandomness === undefined) {
        throw new Error(`No randomness for chosen cell at index ${realIndex}.`);
      }
      const zkProofs = this.zkProof.createDisjunctiveEncryptionProof(
        ciphertexts,
        realIndex,
        chosenRandomness,
      );
      const encryptedVoteRecord = this.buildEncryptedVoteRecord(
        orderedCandidateIds,
        ciphertexts,
        zkProofs,
      );
      const auditableVote = { ciphertexts: ciphertexts, randomness: randomness };

      encryptedVotes.push(encryptedVoteRecord);
      auditableVotes.push(auditableVote);
    }

    return [{ sectionId, votes: encryptedVotes }, auditableVotes];
  }

  /**
   * Extracts plaintexts from a single vote record in given candidate order.
   * These plaintexts are instantly encoded and encrypted, every cell with fresh randomness.
   * Returns the ciphertexts, the index of the chosen cell and the randomness of every cell.
   */
  private extractAndEncryptVotes(
    vote: VoteRecord,
    candidateIds: string[],
  ): [Ciphertext[], number, bigint[]] {
    const ciphertexts: Ciphertext[] = [];
    const randomness: bigint[] = [];

    const realIndex = candidateIds.findIndex((id) => vote[id] === 1);

    for (const candidateId of candidateIds) {
      const voteData = vote[candidateId];
      if (voteData === undefined) {
        throw new Error(`Missing vote data for candidate ${candidateId}`);
      }

      const encodedPlaintext: bigint = modPow(
        this.publicKey.getGenerator(),
        BigInt(voteData),
        this.publicKey.getPrimeP(),
      );

      const [ciphertext, cellRandomness] = this.publicKey.encrypt(encodedPlaintext);
      ciphertexts.push(ciphertext);
      randomness.push(cellRandomness);
    }

    return [ciphertexts, realIndex, randomness];
  }

  /**
   * Builds an encrypted vote record by mapping ciphertexts and zero-knowledge-proofs.
   */
  private buildEncryptedVoteRecord(
    candidateIds: string[],
    ciphertexts: Ciphertext[],
    zkProofs: ZKProof[],
  ): EncryptedVote {
    const encryptedVoteRecord: EncryptedVote = {};

    for (let i = 0; i < candidateIds.length; i++) {
      const candidateId = candidateIds[i];
      const ciphertext = ciphertexts[i];
      const zkProof = zkProofs[i];

      if (candidateId === undefined) {
        // should never happen in normal operation, but typescript needs to know candidateId is defined
        throw new Error(`Candidate ID is undefined at index ${i}.`);
      }
      if (ciphertext === undefined) {
        // should never happen in normal operation, but typescript needs to know ciphertext is defined
        throw new Error(`Ciphertext is undefined at index ${i}.`);
      }
      if (zkProof === undefined) {
        // should never happen in normal operation, but typescript needs to know zkProof is defined
        throw new Error(`Zero-knowledge-proof is undefined at index ${i}.`);
      }

      encryptedVoteRecord[candidateId] = {
        alpha: String(ciphertext[0]),
        beta: String(ciphertext[1]),
        commitment1: String(zkProof.commitment[0]),
        commitment2: String(zkProof.commitment[1]),
        challenge: String(zkProof.challenge),
        response: String(zkProof.response),
      };
    }

    return encryptedVoteRecord;
  }
}
