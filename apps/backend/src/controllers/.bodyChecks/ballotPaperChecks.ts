import type { BallotPaper as DBBallotPaper } from '@repo/db/types';
import {
  updateableBallotPaperObject,
  zodErrorToResponse400,
  type UpdateableBallotPaper,
} from '@repo/votura-validators';
import type { Selectable } from 'kysely';
import { HttpStatusCode } from '../../httpStatusCode.js';
import { getBallotPaperMaxVotes } from '../../services/ballotPapers.service.js';
import { getMaxBPSMaxVotesForBP } from '../../services/ballotPaperSections.service.js';
import type { BodyCheckValidationError } from './bodyCheckValidationError.js';

//----------- Ballot Paper MaxVotes and MaxVotesPerCandidate Checks -----------
export enum BallotPaperBodyCheckValidationErrorMessage {
  maxVotesExceeded = 'The max votes for the ballot paper cannot be lower than the max votes of any related ballot paper section.',
  maxVotesPerCandidateExceeded = 'The max votes per candidate for the ballot paper cannot be lower than the max votes per candidate of any related ballot paper section.',
}

export interface BallotPaperBodyCheckValidationError extends BodyCheckValidationError {
  message: BallotPaperBodyCheckValidationErrorMessage | string;
}

export const validateUpdateableBallotPaper = async (
  body: unknown,
  ballotPaperId: Selectable<DBBallotPaper>['id'],
): Promise<UpdateableBallotPaper | BallotPaperBodyCheckValidationError> => {
  const { data, error, success } = await updateableBallotPaperObject.safeParseAsync(body);
  if (!success) {
    return {
      status: HttpStatusCode.badRequest,
      message: zodErrorToResponse400(error).message,
    };
  }

  const { maxVotes: oldMaxVotes, maxVotesPerCandidate: oldMaxVotesPerCandidate } =
    await getBallotPaperMaxVotes(ballotPaperId);

  // If the new maxVotes and maxVotesPerCandidate are greater than or equal to the old values, no need to check further
  if (data.maxVotes >= oldMaxVotes && data.maxVotesPerCandidate >= oldMaxVotesPerCandidate) {
    return data;
  }

  const { maxVotes: maxVotesFromSections, maxVotesPerCandidate: maxVotesPerCandidateFromSections } =
    await getMaxBPSMaxVotesForBP(ballotPaperId);

  // Check if the new maxVotes and maxVotesPerCandidate are valid against the sections
  let message = '';
  if (maxVotesFromSections > data.maxVotes) {
    message = BallotPaperBodyCheckValidationErrorMessage.maxVotesExceeded;
  } else if (maxVotesPerCandidateFromSections > data.maxVotesPerCandidate) {
    message = BallotPaperBodyCheckValidationErrorMessage.maxVotesPerCandidateExceeded;
  }
  if (message !== '') {
    return {
      status: HttpStatusCode.badRequest,
      message,
    };
  }

  return data;
};
