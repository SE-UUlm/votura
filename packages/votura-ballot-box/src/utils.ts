import type {
  EncryptedFilledBallotPaper,
  EncryptedVoteProof,
  PlainFilledBallotPaper,
} from '@repo/votura-validators';
import type { ZKProof } from '@votura/votura-crypto/index';

type PlainSectionVotes = PlainFilledBallotPaper['sections'][string];
type EncryptedSectionVotes = EncryptedFilledBallotPaper['sections'][string];

/**
 * Converts a zero-knowledge proof to the string representation of the encrypted ballot format.
 */
export const serializeProof = (proof: ZKProof): EncryptedVoteProof => ({
  commitment1: String(proof.commitment[0]),
  commitment2: String(proof.commitment[1]),
  challenge: String(proof.challenge),
  response: String(proof.response),
});

/**
 * Converts a proof of the encrypted ballot format back to a zero-knowledge proof.
 */
export const deserializeProof = (proof: EncryptedVoteProof): ZKProof => ({
  commitment: [BigInt(proof.commitment1), BigInt(proof.commitment2)],
  challenge: BigInt(proof.challenge),
  response: BigInt(proof.response),
});

/**
 * Extracts and returns a consistent ordering of candidate IDs from the first vote.
 * The ordering is alphabetical to ensure consistency across all votes.
 */
export const extractCandidateIds = (
  section: PlainSectionVotes | EncryptedSectionVotes,
): string[] => {
  const firstVote = section.votes[0];
  if (!firstVote) {
    throw new Error('No votes found in section.');
  }
  const candidateIds = Object.keys(firstVote).sort((a, b) => a.localeCompare(b));

  for (let i = 1; i < section.votes.length; i++) {
    const vote = section.votes[i];
    if (!vote) {
      throw new Error('No votes found in section.');
    }
    const keys = Object.keys(vote).sort((a, b) => a.localeCompare(b));
    if (keys.length !== candidateIds.length) {
      throw new Error(`Inconsistent vote structure at index ${i}: different number of candidates.`);
    }
    for (let j = 0; j < keys.length; j++) {
      if (keys[j] !== candidateIds[j]) {
        throw new Error(`Inconsistent vote structure at index ${i}: different candidateIds.`);
      }
    }
  }
  return candidateIds;
};
