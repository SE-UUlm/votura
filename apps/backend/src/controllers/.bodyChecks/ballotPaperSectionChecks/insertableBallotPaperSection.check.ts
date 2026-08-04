import type { BallotPaper as DBBallotPaper } from '@repo/db/types';
import {
  insertableBallotPaperSectionObject,
  zodErrorToResponse400,
  type InsertableBallotPaperSection,
} from '@repo/votura-validators';
import type { Selectable } from 'kysely';
import { HttpStatusCode } from '../../../httpStatusCode.js';
import {
  defaultChecksBallotPaperSection,
  type BallotPaperSectionBodyCheckValidationError,
} from './common.check.js';

export const validateInsertableBallotPaperSection = async (
  body: unknown,
  ballotPaperId: Selectable<DBBallotPaper>['id'],
): Promise<InsertableBallotPaperSection | BallotPaperSectionBodyCheckValidationError> => {
  const { data, error, success } = await insertableBallotPaperSectionObject.safeParseAsync(body);
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
