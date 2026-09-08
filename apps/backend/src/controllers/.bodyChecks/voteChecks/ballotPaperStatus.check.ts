import { HttpStatusCode } from '../../../httpStatusCode.js';
import { checkVoterMayVoteOnBallotPaper } from '../../../services/voters.service.js';
import {
  type VoteValidationError,
  VoteValidationErrorMessage,
} from './encryptedFilledBallotPaper.check.js';

/**
 * Validate if the ballot paper exists, the voter is assigned to it, and they haven't voted yet.
 * @param voterId The ID of the voter.
 * @param ballotPaperId The ID of the ballot paper.
 * @returns A validation error if the voter is not allowed to vote, otherwise null.
 */
export const validateBallotPaperStatus = async (
  voterId: string,
  ballotPaperId: string,
): Promise<VoteValidationError | null> => {
  const mayVote = await checkVoterMayVoteOnBallotPaper(voterId, ballotPaperId);
  if (!mayVote) {
    return {
      status: HttpStatusCode.forbidden,
      message: VoteValidationErrorMessage.notAllowedToVote,
    };
  }
  return null;
};
