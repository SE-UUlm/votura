import type { BallotPaper as DBBallotPaper } from '@repo/db/types';
import {
  updateableBallotPaperSectionObject,
  zodErrorToResponse400,
  type UpdateableBallotPaperSection,
} from '@repo/votura-validators';
import type { Selectable } from 'kysely';
import { HttpStatusCode } from '../../../httpStatusCode.js';
import {
  defaultChecksBallotPaperSection,
  type BallotPaperSectionBodyCheckValidationError,
} from './common.check.js';

export const validateUpdateableBallotPaperSection = async (
  body: unknown,
  ballotPaperId: Selectable<DBBallotPaper>['id'],
): Promise<UpdateableBallotPaperSection | BallotPaperSectionBodyCheckValidationError> => {
  const { data, error, success } = await updateableBallotPaperSectionObject.safeParseAsync(body);
  if (!success) {
    return {
      status: HttpStatusCode.badRequest,
      message: zodErrorToResponse400(error).message,
    };
  }

  const validationError = await defaultChecksBallotPaperSection(
    ballotPaperId,
    data.maxVotes,
    data.maxVotesPerCandidate,
  );
  if (validationError !== null) {
    return validationError;
  }

  // If all checks passed, return the validated data
  return data;
};
