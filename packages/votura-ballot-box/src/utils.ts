import type { EncryptedFilledBallotPaper, PlainFilledBallotPaper } from '@repo/votura-validators';

type PlainSectionVotes = PlainFilledBallotPaper['sections'][string];
type EncryptedSectionVotes = EncryptedFilledBallotPaper['sections'][string];

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
