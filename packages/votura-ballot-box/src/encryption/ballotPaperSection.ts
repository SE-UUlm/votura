import type { PlainBallotPaper } from '@repo/votura-validators';
import {
  ZeroKnowledgeProof,
  type Ciphertext,
  type PublicKey,
  type ZKProof,
} from '@votura/votura-crypto/index';
import { modPow } from 'bigint-crypto-utils';

export interface EncryptedSection {
  sectionId: string;
  votes: Record<
    string,
    {
      alpha: bigint;
      beta: bigint;
      commitment1: bigint;
      commitment2: bigint;
      challenge: bigint;
      response: bigint;
    }
  >[];
}

type SectionVotes = PlainBallotPaper['sections'][string];
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
   * Encrypts the vote of a single ballot paper section and returns the encrypted vote as EncryptedSection.
   * Expects that the ballot paper the section stems from has been validated using the zod plainBallotPaper schema.
   * @param section The ballot paper section to encrypt
   * @param sectionId The ID of the section being processed
   * @returns Encrypted vote of a single ballot paper section
   */
  public encryptSection(section: SectionVotes, sectionId: string): EncryptedSection {
    const encryptedVotes: EncryptedSection['votes'] = [];
    const allRandomnessForAudit: bigint[] = [];

    const orderedCandidateIds = this.extractCandidateIds(section);
    for (const vote of section.votes) {
      const [ciphertexts, realIndex, randomness] = this.extractAndEncryptVotes(
        vote,
        orderedCandidateIds,
      );
      const zkProofs = this.zkProof.createDisjunctiveEncryptionProof(
        ciphertexts,
        realIndex,
        randomness,
      );
      const encryptedVoteRecord = this.buildEncryptedVoteRecord(
        orderedCandidateIds,
        ciphertexts,
        zkProofs,
      );

      encryptedVotes.push(encryptedVoteRecord);
      allRandomnessForAudit.push(randomness);
    }

    return { sectionId, votes: encryptedVotes };
  }

  /**
   * Extracts and returns a consistent ordering of candidate IDs from the first vote.
   * The ordering is alphabetical to ensure consistency across all votes.
   */
  private extractCandidateIds(section: SectionVotes): string[] {
    const firstVote = section.votes[0];
    if (!firstVote) {
      // should never happen due to zod validation, but typescript doesn't know that
      throw new Error('No votes found in section.');
    }
    const candidateIds = Object.keys(firstVote).sort((a, b) => a.localeCompare(b));

    for (let i = 1; i < section.votes.length; i++) {
      const vote = section.votes[i];
      if (!vote) {
        // should never happen due to zod validation, but typescript doesn't know that
        throw new Error('No votes found in section.');
      }
      const keys = Object.keys(vote).sort((a, b) => a.localeCompare(b));
      if (keys.length !== candidateIds.length) {
        throw new Error(
          `Inconsistent vote structure at index ${i}: different number of candidates.`,
        );
      }
      for (let j = 0; j < keys.length; j++) {
        if (keys[j] !== candidateIds[j]) {
          throw new Error(`Inconsistent vote structure at index ${i}: different candidateIds.`);
        }
      }
    }
    return candidateIds;
  }

  /**
   * Extracts plaintexts from a single vote record in given candidate order.
   * These plaintexts are instantly encoded and encrypted.
   */
  private extractAndEncryptVotes(
    vote: VoteRecord,
    candidateIds: string[],
  ): [Ciphertext[], number, bigint] {
    const ciphertexts: Ciphertext[] = [];
    let voteRandomness = -1n;

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

      if (voteRandomness === -1n) {
        // generate new randomness with first encryption
        const [ciphertext, randomness] = this.publicKey.encrypt(encodedPlaintext);
        voteRandomness = randomness;
        ciphertexts.push(ciphertext);
      } else {
        // use same randomness for the entire vote
        const [ciphertext, randomness] = this.publicKey.encrypt(encodedPlaintext, voteRandomness);
        if (randomness !== voteRandomness) {
          // this should never happen
          throw new Error('Different randomness values used while encrypting the same vote.');
        }
        ciphertexts.push(ciphertext);
      }
    }

    return [ciphertexts, realIndex, voteRandomness];
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
        alpha: ciphertext[0],
        beta: ciphertext[1],
        commitment1: zkProof.commitment[0],
        commitment2: zkProof.commitment[1],
        challenge: zkProof.challenge,
        response: zkProof.response,
      };
    }

    return encryptedVoteRecord;
  }
}
