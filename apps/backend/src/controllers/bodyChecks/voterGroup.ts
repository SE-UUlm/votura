import { insertableVoterGroupObject, type InsertableVoterGroup } from '@repo/votura-validators';
import type { ZodError } from 'zod/v4';
import {
  checkBallotPapersBelongToUser,
  checkBallotPapersElectionNotFrozen,
  checkBallotPapersExist,
  checkBallotPapersFromDifferentElections,
} from '../../services/ballotPapers.service.js';

export enum VoterGroupValidationError {
  ballotPaperNotFound = 'One or more ballot papers to be added to voter group not found.',
  ballotPaperNotBelongToUser = 'One or more ballot papers to be added to voter group do not belong to the user.',
  ballotPapersFromSameElection = 'One or more ballot papers to be added to voter group belong to the same election.',
  ballotPapersFromFrozenElection = 'One or more ballot papers to be added to voter group belong to a frozen election.',
}

export const validateInsertableVoterGroup = async (
  body: unknown,
  userId: string,
): Promise<InsertableVoterGroup | ZodError | VoterGroupValidationError> => {
  // Validate the request body against the insertableVoterGroupObject schema
  const { data, error, success } = await insertableVoterGroupObject.safeParseAsync(body);
  if (!success) {
    return error;
  }

  if (data.ballotPapers.length !== 0) {
    // make sure the ballotPaper IDs are unique
    const uniqueBallotPaperIds = [...new Set(data.ballotPapers)];

    // check if all ballot papers in the request body exist
    if (!(await checkBallotPapersExist(uniqueBallotPaperIds))) {
      return VoterGroupValidationError.ballotPaperNotFound;
    }

    // make sure all ballot papers belong to the user
    if (!(await checkBallotPapersBelongToUser(uniqueBallotPaperIds, userId))) {
      return VoterGroupValidationError.ballotPaperNotBelongToUser;
    }

    // make sure all ballot papers belong to different elections
    if (!(await checkBallotPapersFromDifferentElections(uniqueBallotPaperIds))) {
      return VoterGroupValidationError.ballotPapersFromSameElection;
    }

    // make sure the elections the ballot papers belong to are not frozen
    if (!(await checkBallotPapersElectionNotFrozen(uniqueBallotPaperIds))) {
      return VoterGroupValidationError.ballotPapersFromFrozenElection;
    }
  }

  return data;
};
