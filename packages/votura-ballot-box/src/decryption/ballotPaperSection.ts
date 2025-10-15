import {
  filledBallotPaperDefaultVoteOption,
  type EncryptedFilledBallotPaper,
} from '@repo/votura-validators';
import {
  Tallying,
  ZeroKnowledgeProof,
  type Ciphertext,
  type PrivateKey,
  type ZKProof,
} from '@votura/votura-crypto/index';
import { modPow } from 'bigint-crypto-utils';
import { extractCandidateIds } from '../utils.js';

export interface DecryptedSection {
  sectionId: string;
  candidateResults: Record<string, number>;
  noVoteCount: number;
  invalidCount: number;
}

export enum SectionDecryptionError {
  candidateExtractionFailed = 'Failed to extract candidates from ballot paper section.',
  verificationFailed = 'Failed to verify ciphertexts in ballot paper section.',
  voteDecryptionFailed = 'Failed to decrypt votes in ballot paper section.',
}

type SectionVotes = EncryptedFilledBallotPaper['sections'][string];
type VoteRecord = SectionVotes['votes'][number];

export class BallotPaperSectionDecryption {
  private readonly privateKey: PrivateKey;

  private readonly tallying: Tallying;

  private readonly zkp: ZeroKnowledgeProof;

  private discreteLogLookup: Map<bigint, number> | null = null;

  public constructor(privateKey: PrivateKey) {
    this.privateKey = privateKey;
    this.tallying = new Tallying(privateKey);
    this.zkp = new ZeroKnowledgeProof(privateKey);
  }

  /**
   * Calculates and stores a lookup table for converting encoded votes to plaintext counts.
   * This should be called once with the maximum possible vote count that can be encoded.
   * @param maxVotes Maximum number of votes that can be cast
   */
  public calculateLookupTable(maxVotes: number): void {
    if (maxVotes < 0) {
      throw new Error('maxVotes must be a non-negative integer');
    }

    this.discreteLogLookup = new Map<bigint, number>();

    // Calculate g^i mod p for i = 0 to maxVotes
    // This allows us to convert encrypted sums back to vote counts
    for (let i = 0; i <= maxVotes; i++) {
      const encoded = modPow(
        this.privateKey.getGenerator(),
        BigInt(i),
        this.privateKey.getPrimeP(),
      );
      this.discreteLogLookup.set(encoded, i);
    }
  }

  /**
   * Decrypts a single ballot paper section and returns plaintext vote counts as DecryptedSectionResult.
   * During decryption, verifies the integrity of each ciphertext using its associated zero-knowledge proof.
   * Expects that calculateLookupTable() has been called beforehand.
   * Expects that the ballot paper the section stems from has been validated using the zod encryptedFilledBallotPaper schema.
   * Returns SectionDecryptionError if any step fails.
   * @param section The ballot paper section to decrypt
   * @param sectionId The ID of the section being processed
   * @returns Decrypted results with vote counts per candidate or a SectionDecryptionError on failure
   */
  public decryptSection(
    section: SectionVotes,
    sectionId: string,
  ): DecryptedSection | SectionDecryptionError {
    if (!this.discreteLogLookup) {
      throw new Error('Lookup table not initialized. Call calculateLookupTable() first.');
    }

    let orderedCandidateIds: string[] = [];
    try {
      orderedCandidateIds = extractCandidateIds(section);
    } catch {
      return SectionDecryptionError.candidateExtractionFailed;
    }

    const orderedCiphertexts = this.extractAndVerifyAllCiphertexts(section, orderedCandidateIds);
    if (orderedCiphertexts === null) {
      return SectionDecryptionError.verificationFailed;
    }

    let orderedVoteCounts: number[] = [];
    try {
      orderedVoteCounts = this.decryptAndConvertVotes(orderedCiphertexts);
    } catch {
      return SectionDecryptionError.voteDecryptionFailed;
    }

    return this.buildDecryptedSection(sectionId, orderedCandidateIds, orderedVoteCounts);
  }

  /**
   * Extracts and verifies ciphertexts from all votes for each candidate in the given ordering.
   * Verification is done using the proofs for each ciphertext (commitments, challenge, response).
   * Returns null if any verification fails.
   */
  private extractAndVerifyAllCiphertexts(
    section: SectionVotes,
    candidateIds: string[],
  ): Ciphertext[][] | null {
    const allVoteCiphertexts: Ciphertext[][] = [];

    for (const vote of section.votes) {
      const voteCiphertexts = this.extractAndVerifyVoteCiphertexts(vote, candidateIds);
      if (voteCiphertexts === null) {
        return null; // Verification failed for this vote
      }
      allVoteCiphertexts.push(voteCiphertexts);
    }

    return allVoteCiphertexts;
  }

  /**
   * Extracts and verifies ciphertexts from a single vote record in given candidate order.
   * Verification is done using the proofs for each ciphertext (commitments, challenge, response).
   * Returns null if any verification fails.
   */
  private extractAndVerifyVoteCiphertexts(
    vote: VoteRecord,
    candidateIds: string[],
  ): Ciphertext[] | null {
    const ciphertexts: Ciphertext[] = [];
    const zkProofs: ZKProof[] = [];

    for (const candidateId of candidateIds) {
      const voteData = vote[candidateId];
      if (voteData === undefined) {
        // should never happen, as the candidate Ids are extracted from the votes beforehand
        throw new Error(`Missing vote data for candidate ${candidateId}`);
      }

      const ciphertext: Ciphertext = [BigInt(voteData.alpha), BigInt(voteData.beta)];
      const zkProof: ZKProof = {
        commitment: [BigInt(voteData.commitment1), BigInt(voteData.commitment2)],
        challenge: BigInt(voteData.challenge),
        response: BigInt(voteData.response),
      };
      ciphertexts.push(ciphertext);
      zkProofs.push(zkProof);
    }

    // Verify all ciphertexts for this vote
    const allValid = this.zkp.verifyDisjunctiveEncryptionProof(ciphertexts, zkProofs);

    // If any proof is invalid, return null
    return allValid ? ciphertexts : null;
  }

  /**
   * Aggregates, decrypts, and converts encrypted votes to plaintext counts.
   * Stays true to the ordering of candidates provided.
   */
  private decryptAndConvertVotes(allVoteCiphertexts: Ciphertext[][]): number[] {
    // Aggregate all votes using the tallying system
    const aggregatedCiphertexts = this.tallying.aggregateVotes(allVoteCiphertexts);

    // Decrypt the aggregated results
    const decryptedValues = this.decryptAggregatedVotes(aggregatedCiphertexts);

    // Convert encrypted sums to vote counts using lookup table
    return this.convertToVoteCounts(decryptedValues);
  }

  /**
   * Decrypts aggregated ciphertexts to encoded values.
   */
  private decryptAggregatedVotes(aggregatedCiphertexts: Ciphertext[]): bigint[] {
    const decryptedValues: bigint[] = [];

    for (const ciphertext of aggregatedCiphertexts) {
      const decryptedValue = this.privateKey.decrypt(ciphertext);
      decryptedValues.push(decryptedValue);
    }

    return decryptedValues;
  }

  /**
   * Converts encoded vote sums to plaintext vote counts using the lookup table.
   */
  private convertToVoteCounts(decryptedValues: bigint[]): number[] {
    const voteCounts: number[] = [];

    for (const encodedSum of decryptedValues) {
      const count = this.discreteLogLookup?.get(encodedSum);
      if (count === undefined) {
        throw new Error(`Unable to decode encoded sum. Lookup table may be too small.`);
      }
      voteCounts.push(count);
    }

    return voteCounts;
  }

  /**
   * Builds the final decrypted section by mapping vote counts to candidates.
   */
  private buildDecryptedSection(
    sectionId: string,
    candidateIds: string[],
    voteCounts: number[],
  ): DecryptedSection {
    const result: DecryptedSection = {
      sectionId,
      candidateResults: {},
      noVoteCount: 0,
      invalidCount: 0,
    };

    for (let i = 0; i < candidateIds.length; i++) {
      const candidateId = candidateIds[i];
      const count = voteCounts[i];

      if (candidateId === undefined) {
        // should never happen in normal operation, but typescript needs to know that candidateId is defined
        throw new Error(`Candidate ID is undefined at index ${i}`);
      }
      if (count === undefined) {
        // should never happen in normal operation, but typescript needs to know that count is defined
        const lengthMismatch = candidateIds.length !== voteCounts.length;
        throw new Error(
          `Vote count is undefined at index ${i}. Length mismatch: ${lengthMismatch}`,
        );
      }

      if (candidateId === filledBallotPaperDefaultVoteOption.noVote) {
        result.noVoteCount = count;
      } else if (candidateId === filledBallotPaperDefaultVoteOption.invalid) {
        result.invalidCount = count;
      } else {
        result.candidateResults[candidateId] = count;
      }
    }

    return result;
  }
}
