import type { DecryptedSection } from '@repo/votura-ballot-box';

/**
 * Check if the number of invalid votes in a section is either zero or equals the total number of votes in that section.
 * Also make sure that invalid votes are only present if they are allowed.
 * If not, the section is invalid.
 * @param votesInSection The decrypted votes in the section.
 * @param sectionVoteCount The total number of votes in the section.
 * @param invalidVotesAllowed Whether invalid votes are allowed in the election the votes belong to. True if allowed.
 * @returns True if the invalid vote count is valid and invalid votes are only used if they are allowed, otherwise false.
 */
export const validateSectionInvalidVotes = (
  votesInSection: DecryptedSection,
  sectionVoteCount: number,
  invalidVotesAllowed: boolean,
): boolean => {
  const { invalidCount } = votesInSection;
  return invalidCount === 0 || (invalidVotesAllowed && invalidCount === sectionVoteCount);
};
