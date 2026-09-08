import type { BallotPaperSectionDecryption } from '@repo/votura-ballot-box';
import type { EncryptedFilledBallotPaper } from '@repo/votura-validators';
import {
  isBodyCheckValidationError,
  type BodyCheckValidationError,
} from '../bodyCheckValidationError.js';
import { aggregateVotes, validateAggregatedResults } from './aggregatedResults.check.js';
import { createBallotDecryption } from './ballotDecryption.check.js';
import { validateBallotPaperStatus } from './ballotPaperStatus.check.js';
import { validateBallotPaperStructure } from './ballotPaperStructure.check.js';
import { validateElectionIsVotable } from './electionIsVotable.check.js';
import { processAndValidateSections } from './processSections.check.js';
import { validateRequestBody } from './requestBody.check.js';
import { validateSectionVotes } from './sectionVotes.check.js';

export enum VoteValidationErrorMessage {
  notAllowedToVote = 'The voter is not allowed to vote on the specified ballot paper, either because it does not exist, the voter is not assigned to it, or they already voted.',
  electionNotVotable = "The election the ballot paper belongs to is not votable e.g. because it hasn't started yet or isn't frozen.",
  invalidVote = 'The contents of the filled ballot paper are invalid and can not be accepted.',
}

export interface VoteValidationError extends BodyCheckValidationError {
  message: VoteValidationErrorMessage | string;
}

/**
 * Checks and validates an encrypted filled ballot paper.
 * If any check fails, an appropriate error is returned.
 * If all checks pass, the validated filled ballot paper is returned and can be safely stored.
 * @param body The request body containing the filled ballot paper.
 * @param voterId The ID of the voter submitting the ballot paper.
 * @returns The validated filled ballot paper or a validation error.
 */
export const validateEncryptedFilledBallotPaper = async (
  body: unknown,
  voterId: string,
): Promise<EncryptedFilledBallotPaper | VoteValidationError> => {
  // Step 1: Validate request body schema
  const bodyValidationResult = await validateRequestBody(body);
  if (isBodyCheckValidationError(bodyValidationResult)) {
    return bodyValidationResult;
  }
  const data = bodyValidationResult;

  // Step 2: Validate if the ballot paper exists, the voter is assigned to it, and they haven't voted yet
  const permissionError = await validateBallotPaperStatus(voterId, data.ballotPaperId);
  if (permissionError !== null) {
    return permissionError;
  }

  // Step 3: Validate if the election is votable (started, not ended, and frozen)
  const electionError = await validateElectionIsVotable(data.ballotPaperId);
  if (electionError !== null) {
    return electionError;
  }

  // Step 4: Validate ballot paper structure (only expected sections are included)
  const structureError = await validateBallotPaperStructure(data);
  if (structureError !== null) {
    return structureError;
  }

  // Step 5: Validate section votes and candidate IDs (vote count equals maxVotes, candidate IDs are the ones linked to the section)
  const sectionError = await validateSectionVotes(data);
  if (sectionError !== null) {
    return sectionError;
  }

  // Step 6: Process and validate sections with decryption
  // (either all votes are invalid or none, invalid votes are only present if allowed, no candidate exceeds maxVotesPerCandidate, all ciphertext proofs are valid)
  // maxVotes of the Section does not need to be checked here, as the section only contains as many votes (including 'noVote') as maxVotes, as assured by step 5
  const decryption: BallotPaperSectionDecryption = await createBallotDecryption(data.ballotPaperId);
  const { sections: votesInSections, error: processingError } = await processAndValidateSections(
    data,
    decryption,
  );
  if (processingError !== undefined) {
    return processingError;
  }

  // Step 7: Aggregate votes and validate final results for the entire ballot paper
  // (either all votes are invalid or none,
  // no candidate exceeds maxVotesPerCandidate,
  // the sum of votes for candidates over all sections is not greater than maxVotes of the ballot paper)
  const { totalVotesPerCandidate, totalInvalidCount } = aggregateVotes(votesInSections);
  const aggregationError = await validateAggregatedResults(
    data,
    totalVotesPerCandidate,
    totalInvalidCount,
  );
  if (aggregationError !== null) {
    return aggregationError;
  }

  return data;
};
