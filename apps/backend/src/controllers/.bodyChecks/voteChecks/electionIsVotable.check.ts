import { HttpStatusCode } from '../../../httpStatusCode.js';
import { checkBallotPaperIsVotable } from '../../../services/ballotPapers.service.js';
import {
  type VoteValidationError,
  VoteValidationErrorMessage,
} from './encryptedFilledBallotPaper.check.js';

/**
 * Check if the election the ballot paper belongs to is votable (i.e., started, not ended, and frozen).
 * @param ballotPaperId The ID of the ballot paper.
 * @returns A validation error if the election is not votable, otherwise null.
 */
export const validateElectionIsVotable = async (
  ballotPaperId: string,
): Promise<VoteValidationError | null> => {
  const isVotable = await checkBallotPaperIsVotable(ballotPaperId);
  if (!isVotable) {
    return {
      status: HttpStatusCode.forbidden,
      message: VoteValidationErrorMessage.electionNotVotable,
    };
  }
  return null;
};
