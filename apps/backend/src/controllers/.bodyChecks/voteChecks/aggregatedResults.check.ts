import type { DecryptedSection } from '@repo/votura-ballot-box';
import type { EncryptedFilledBallotPaper } from '@repo/votura-validators';
import { HttpStatusCode } from '../../../httpStatusCode.js';
import { getBallotPaperMaxVotes } from '../../../services/ballotPapers.service.js';
import {
  type VoteValidationError,
  VoteValidationErrorMessage,
} from './encryptedFilledBallotPaper.check.js';

/**
 * Aggregates votes across the given decrypted ballot paper sections.
 * Disregards 'noVote' counts and sums up votes per candidate and total invalid votes.
 * @param decryptedVotesInSections Array of decrypted votes per section.
 * @returns The aggregated votes per candidate and invalid count.
 */
export const aggregateVotes = (
  decryptedVotesInSections: DecryptedSection[],
): { totalVotesPerCandidate: Record<string, number>; totalInvalidCount: number } => {
  const totalVotesPerCandidate: Record<string, number> = {};
  let totalInvalidCount = 0;

  for (const votesInSection of decryptedVotesInSections) {
    // Aggregate candidate votes
    for (const [candidateId, votes] of Object.entries(votesInSection.candidateResults)) {
      totalVotesPerCandidate[candidateId] = (totalVotesPerCandidate[candidateId] ?? 0) + votes;
    }

    totalInvalidCount += votesInSection.invalidCount;
  }

  return { totalVotesPerCandidate, totalInvalidCount };
};

/**
 * Checks the aggregated results for the entire ballot paper.
 * Validates global invalid votes consistency (either all votes are invalid or none),
 * global candidate vote limits (no candidate exceeds maxVotesPerCandidate of the ballot paper)
 * and total votes against maxVotes of the ballot paper.
 * @param encryptedFilledBallotPaper The encrypted filled ballot paper data.
 * @param totalVotesPerCandidate A record of total votes per candidate across all sections.
 * @param totalInvalidCount The total invalid vote count.
 * @returns A validation error if any checks fail, or null if all checks pass.
 */
export const validateAggregatedResults = async (
  encryptedFilledBallotPaper: EncryptedFilledBallotPaper,
  totalVotesPerCandidate: Record<string, number>,
  totalInvalidCount: number,
): Promise<VoteValidationError | null> => {
  const totalVoteCount = Object.values(encryptedFilledBallotPaper.sections).flatMap(
    (s) => s.votes,
  ).length;

  // Validate ballot paper invalid votes consistency (either all votes are invalid or none are)
  if (totalInvalidCount !== 0 && totalInvalidCount !== totalVoteCount) {
    return {
      status: HttpStatusCode.badRequest,
      message: VoteValidationErrorMessage.invalidVote,
    };
  }

  const { maxVotes: maxVotesBP, maxVotesPerCandidate: maxVotesPerCandidateBP } =
    await getBallotPaperMaxVotes(encryptedFilledBallotPaper.ballotPaperId);
  let totalVotesForAllCandidates = 0;

  // Validate ballot paper candidate vote limits (no candidate exceeds maxVotesPerCandidate of the ballot paper)
  for (const votes of Object.values(totalVotesPerCandidate)) {
    if (votes > maxVotesPerCandidateBP) {
      return {
        status: HttpStatusCode.badRequest,
        message: VoteValidationErrorMessage.invalidVote,
      };
    }

    totalVotesForAllCandidates += votes;
  }

  // Validate that the sum of votes for candidates does not exceed maxVotes of the ballot paper
  if (totalVotesForAllCandidates > maxVotesBP) {
    return {
      status: HttpStatusCode.badRequest,
      message: VoteValidationErrorMessage.invalidVote,
    };
  }

  return null;
};
