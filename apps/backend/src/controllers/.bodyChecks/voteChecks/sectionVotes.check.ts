import {
  filledBallotPaperDefaultVoteOption,
  type EncryptedFilledBallotPaper,
} from '@repo/votura-validators';
import { HttpStatusCode } from '../../../httpStatusCode.js';
import {
  getBPSMaxVotesForBP,
  getCandidateIdsForBallotPaperSection,
} from '../../../services/ballotPaperSections.service.js';
import { setsEqual } from '../../../utils.js';
import {
  VoteValidationErrorMessage,
  type VoteValidationError,
} from './encryptedFilledBallotPaper.check.js';

/**
 * Extracts candidate IDs from votes, excluding special options 'noVote' and 'invalid'.
 * If candidate IDs are inconsistent across votes, returns null.
 * @param votes Array of vote objects from which to extract candidate IDs.
 * @returns A set of unique candidate IDs or null if inconsistencies are found.
 */
const extractCandidateIds = (
  votes: EncryptedFilledBallotPaper['sections'][string]['votes'],
): Set<string> | null => {
  const excludedKeys: string[] = [
    filledBallotPaperDefaultVoteOption.noVote,
    filledBallotPaperDefaultVoteOption.invalid,
  ];

  const firstVote = votes[0];
  if (firstVote === undefined) {
    // This case is not reachable due to length checks in validateSectionVotes()
    // Also the Zod schema makes sure the array is not sparsely populated
    throw new Error('Votes Array is empty, cannot extract candidate IDs.');
  }
  const firstVoteCandidateIds = new Set(
    Object.keys(firstVote).filter((key) => !excludedKeys.includes(key)),
  );

  for (let i = 1; i < votes.length; i++) {
    const currentVote = votes[i];
    if (currentVote === undefined) {
      // This case should not be reachable because the Zod schema makes sure the array is not sparsely populated
      return null;
    }
    const currentVoteCandidateIds = new Set(
      Object.keys(currentVote).filter((key) => !excludedKeys.includes(key)),
    );
    if (!setsEqual(firstVoteCandidateIds, currentVoteCandidateIds)) {
      return null;
    }
  }

  return firstVoteCandidateIds;
};

/**
 * Check if each section's votes are equal to the maximum allowed votes in that section (noVote and invalid votes count towards this),
 * and if the candidate IDs in the votes match the expected candidate IDs for that section.
 * @param encryptedFilledBallotPaper The encrypted filled ballot paper to validate.
 * @returns A validation error if any section's votes are invalid, otherwise null.
 */
export const validateSectionVotes = async (
  encryptedFilledBallotPaper: EncryptedFilledBallotPaper,
): Promise<VoteValidationError | null> => {
  const maxVotesPerSection = await getBPSMaxVotesForBP(encryptedFilledBallotPaper.ballotPaperId);

  for (const [sectionId, section] of Object.entries(encryptedFilledBallotPaper.sections)) {
    const votesInSection = section.votes;
    const expectedMaxVotes = maxVotesPerSection[sectionId]?.maxVotes;

    // Validate vote count
    if (votesInSection?.length !== expectedMaxVotes) {
      return {
        status: HttpStatusCode.badRequest,
        message: VoteValidationErrorMessage.invalidVote,
      };
    }

    // Validate candidate IDs
    const candidateIdsInSection = extractCandidateIds(votesInSection);
    if (candidateIdsInSection === null) {
      // candidate IDs are not the same across all votes
      return {
        status: HttpStatusCode.badRequest,
        message: VoteValidationErrorMessage.invalidVote,
      };
    }
    const expectedCandidateIds = await getCandidateIdsForBallotPaperSection(sectionId);

    if (!setsEqual(candidateIdsInSection, new Set(expectedCandidateIds))) {
      return {
        status: HttpStatusCode.badRequest,
        message: VoteValidationErrorMessage.invalidVote,
      };
    }
  }

  return null;
};
