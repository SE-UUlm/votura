import {
  filledBallotPaperDefaultVoteOption,
  type FilledBallotPaper,
} from '@repo/votura-validators';
import { Tallying, type Ciphertext, type PrivateKey } from '@votura/votura-crypto/index';
import { modPow } from 'bigint-crypto-utils';

export interface DecryptedSection {
  sectionId: string;
  candidateResults: Record<string, number>;
  noVoteCount: number;
  invalidCount: number;
}

type SectionVotes = FilledBallotPaper['sections'][string];
type VoteRecord = SectionVotes['votes'][number];

export class BallotPaperSectionDecryption {
  private readonly privateKey: PrivateKey;

  private readonly tallying: Tallying;

  private discreteLogLookup: Map<bigint, number> | null = null;

  public constructor(privateKey: PrivateKey) {
    this.privateKey = privateKey;
    this.tallying = new Tallying(privateKey);
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
      const encoded = modPow(this.privateKey.getGenerator(), BigInt(i), this.privateKey.getPrimeP());
      this.discreteLogLookup.set(encoded, i);
    }
  }

  /**
   * Decrypts a single ballot paper section and returns plaintext vote counts as DecryptedSectionResult.
   * Expects that calculateLookupTable() has been called beforehand.
   * Expects that the ballot paper the section stems from has been validated using the zod filledBallotPaper schema.
   * @param section The ballot paper section to decrypt
   * @param sectionId The ID of the section being processed
   * @returns Decrypted results with vote counts per candidate
   */
  public decryptSection(section: SectionVotes, sectionId: string): DecryptedSection {
    if (!this.discreteLogLookup) {
      throw new Error('Lookup table not initialized. Call calculateLookupTable() first.');
    }

    const orderedCandidateIds = this.extractCandidateIds(section);
    const orderedCiphertexts = this.extractAllCiphertexts(section, orderedCandidateIds);
    const orderedVoteCounts = this.decryptAndConvertVotes(orderedCiphertexts);

    return this.buildDecryptedSection(sectionId, orderedCandidateIds, orderedVoteCounts);
  }

  /**
   * Extracts and returns a consistent ordering of candidate IDs from the first vote.
   * The ordering is alphabetical to ensure consistency across all votes.
   */
  private extractCandidateIds(section: SectionVotes): string[] {
    const firstVote = section.votes[0];
    if (!firstVote) {
      // should never happen due to zod validation, but typescript doesn't know that
      throw new Error('No votes found in section');
    }

    return Object.keys(firstVote).sort((a, b) => a.localeCompare(b));
  }

  /**
   * Extracts ciphertexts from all votes for each candidate in the given ordering.
   */
  private extractAllCiphertexts(section: SectionVotes, candidateIds: string[]): Ciphertext[][] {
    const allVoteCiphertexts: Ciphertext[][] = [];

    for (const vote of section.votes) {
      const voteCiphertexts = this.extractVoteCiphertexts(vote, candidateIds);
      allVoteCiphertexts.push(voteCiphertexts);
    }

    return allVoteCiphertexts;
  }

  /**
   * Extracts ciphertexts from a single vote record in given candidate order.
   */
  private extractVoteCiphertexts(vote: VoteRecord, candidateIds: string[]): Ciphertext[] {
    const ciphertexts: Ciphertext[] = [];

    for (const candidateId of candidateIds) {
      const voteData = vote[candidateId];
      if (voteData === undefined) {
        throw new Error(`Missing vote data for candidate ${candidateId}`);
      }

      const ciphertext: Ciphertext = [BigInt(voteData.alpha), BigInt(voteData.beta)];
      ciphertexts.push(ciphertext);
    }

    return ciphertexts;
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

      if (candidateId === undefined || count === undefined) {
        throw new Error(`Missing data for candidate at index ${i}`);
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
