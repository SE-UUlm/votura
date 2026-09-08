import type {
  BallotPaperSection as DBBallotPaperSection,
  Election as DBElection,
} from '@repo/db/types';
import {
  updateableBallotPaperSectionCandidateObject,
  updateableCandidateOperationOptions,
  zodErrorToResponse400,
  type UpdateableBallotPaperSectionCandidate,
} from '@repo/votura-validators';
import type { Selectable } from 'kysely';
import { HttpStatusCode } from '../../../httpStatusCode.js';
import { isCandidateLinkedToBallotPaperSection } from '../../../services/candidates.service.js';
import {
  BallotPaperCandidateValidationErrorMessage,
  defaultChecksInsertableBallotPaperSectionCandidate,
  type BallotPaperCandidateValidationError,
} from './common.check.js';

export const validateUpdateableBallotPaperSectionCandidate = async (
  body: unknown,
  electionId: Selectable<DBElection>['id'],
  ballotPaperSectionId: Selectable<DBBallotPaperSection>['id'],
): Promise<UpdateableBallotPaperSectionCandidate | BallotPaperCandidateValidationError> => {
  const { data, error, success } =
    await updateableBallotPaperSectionCandidateObject.safeParseAsync(body);
  if (!success) {
    return {
      status: HttpStatusCode.badRequest,
      message: zodErrorToResponse400(error).message,
    };
  }

  const validationError = await defaultChecksInsertableBallotPaperSectionCandidate(
    data.candidateId,
    electionId,
  );
  if (validationError !== null) {
    return validationError;
  }

  // candidate should not be linked to the ballot paper section already if operation is 'add'
  if (
    data.operation === updateableCandidateOperationOptions.add &&
    (await isCandidateLinkedToBallotPaperSection(data.candidateId, ballotPaperSectionId))
  ) {
    return {
      status: HttpStatusCode.badRequest,
      message: BallotPaperCandidateValidationErrorMessage.candidateAlreadyLinked,
    };
  }

  // candidate should be linked to the ballot paper section if operation is 'remove'
  if (
    data.operation === updateableCandidateOperationOptions.remove &&
    !(await isCandidateLinkedToBallotPaperSection(data.candidateId, ballotPaperSectionId))
  ) {
    return {
      status: HttpStatusCode.badRequest,
      message: BallotPaperCandidateValidationErrorMessage.candidateNotLinked,
    };
  }

  return data;
};
