import type { BallotPaper as DBBallotPaper, User as DBUser } from '@repo/db/types';
import type { Selectable } from 'kysely';
import { HttpStatusCode } from '../../../httpStatusCode.js';
import {
  checkBallotPapersBelongToUser,
  checkBallotPapersElectionNotFrozen,
  checkBallotPapersExist,
  checkBallotPapersFromDifferentElections,
} from '../../../services/ballotPapers.service.js';
import type { BodyCheckValidationError } from '../bodyCheckValidationError.js';

export enum VoterGroupValidationErrorMessage {
  ballotPaperNotFound = 'One or more ballot papers to be added to voter group not found.',
  ballotPaperNotBelongToUser = 'One or more ballot papers to be added to voter group do not belong to the user.',
  ballotPapersFromSameElection = 'At least two ballot papers to be added to the voter group belong to the same election.',
  ballotPapersFromFrozenElection = 'One or more ballot papers to be added to voter group belong to a frozen election.',
}

export interface VoterGroupValidationError extends BodyCheckValidationError {
  message: VoterGroupValidationErrorMessage | string;
}

export const defaultVoterGroupChecks = async (
  userId: Selectable<DBUser>['id'],
  ballotPaperIds: Selectable<DBBallotPaper>['id'][],
): Promise<VoterGroupValidationError | null> => {
  if (ballotPaperIds.length !== 0) {
    // make sure the ballotPaper IDs are unique
    const uniqueBallotPaperIds = [...new Set(ballotPaperIds)];

    // check if all ballot papers in the request body exist
    if (!(await checkBallotPapersExist(uniqueBallotPaperIds))) {
      return {
        status: HttpStatusCode.notFound,
        message: VoterGroupValidationErrorMessage.ballotPaperNotFound,
      };
    }

    // make sure all ballot papers belong to the user
    if (!(await checkBallotPapersBelongToUser(uniqueBallotPaperIds, userId))) {
      return {
        status: HttpStatusCode.forbidden,
        message: VoterGroupValidationErrorMessage.ballotPaperNotBelongToUser,
      };
    }

    // make sure all ballot papers belong to different elections
    if (!(await checkBallotPapersFromDifferentElections(uniqueBallotPaperIds))) {
      return {
        status: HttpStatusCode.badRequest,
        message: VoterGroupValidationErrorMessage.ballotPapersFromSameElection,
      };
    }

    // make sure the elections the ballot papers belong to are not frozen
    if (!(await checkBallotPapersElectionNotFrozen(uniqueBallotPaperIds))) {
      return {
        status: HttpStatusCode.badRequest,
        message: VoterGroupValidationErrorMessage.ballotPapersFromFrozenElection,
      };
    }
  }

  return null;
};
