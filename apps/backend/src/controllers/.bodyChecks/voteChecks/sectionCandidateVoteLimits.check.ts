import type { DecryptedSection } from '@repo/votura-ballot-box';

/**
 * Check if any candidate in the section has received more votes than the maximum allowed per candidate. If so, the section is invalid.
 * @param votesInSection The decrypted votes in the section.
 * @param maxVotesPerCandidate The maximum allowed votes per candidate in the section.
 * @returns True if all candidates are within the vote limits, otherwise false.
 */
export const validateSectionCandidateVoteLimits = (
  votesInSection: DecryptedSection,
  maxVotesPerCandidate: number,
): boolean => {
  return Object.values(votesInSection.candidateResults).every(
    (votes) => votes <= maxVotesPerCandidate,
  );
};
