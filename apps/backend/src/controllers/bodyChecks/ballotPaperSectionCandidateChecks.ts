import type {
  BallotPaperSection as DBBallotPaperSection,
  Candidate as DBCandidate,
  Election as DBElection,
} from '@repo/db/types';
import {
  insertableBallotPaperSectionCandidateObject,
  removableBallotPaperSectionCandidateObject,
  type InsertableBallotPaperSectionCandidate,
  type RemovableBallotPaperSectionCandidate,
} from '@repo/votura-validators';
import type { Selectable } from 'kysely';
import { HttpStatusCode } from '../../httpStatusCode.js';
import {
  checkCandidateExists,
  isCandidateLinkedToBallotPaperSection,
  isElectionParentOfCandidate,
} from '../../services/candidates.service.js';
import type { BodyCheckValidationError } from './bodyCheckValidationError.js';

export enum BallotPaperCandidateValidationErrorMessage {
  candidateNotFound = 'Candidate not found.',
  electionNotParent = 'Candidate is not linked to the given election.',
  candidateAlreadyLinked = 'Candidate is already linked to the ballot paper section.',
  candidateNotLinked = 'Candidate is not linked to the ballot paper section.',
  validationError = 'Validation error occurred.',
}
export interface BallotPaperCandidateValidationError extends BodyCheckValidationError {
  message: BallotPaperCandidateValidationErrorMessage | string;
}

const defaultChecksInsertableBallotPaperSectionCandidate = async (
  candidateId: Selectable<DBCandidate>['id'],
  electionId: Selectable<DBElection>['id'],
): Promise<BallotPaperCandidateValidationError | null> => {
  // check if candidate exists, if not return error
  if (!(await checkCandidateExists(candidateId))) {
    return {
      status: HttpStatusCode.notFound,
      message: BallotPaperCandidateValidationErrorMessage.candidateNotFound,
    };
  }

  // check if election is parent of candidate, if not return error
  if (!(await isElectionParentOfCandidate(electionId, candidateId))) {
    return {
      status: HttpStatusCode.badRequest,
      message: BallotPaperCandidateValidationErrorMessage.electionNotParent,
    };
  }

  return null;
};

export const validateInsertableBallotPaperSectionCandidate = async (
  body: unknown,
  electionId: Selectable<DBElection>['id'],
  ballotPaperSectionId: Selectable<DBBallotPaperSection>['id'],
): Promise<InsertableBallotPaperSectionCandidate | BallotPaperCandidateValidationError> => {
  const { data, success } =
    await insertableBallotPaperSectionCandidateObject.safeParseAsync(body);
  if (!success) {
    return {
      status: HttpStatusCode.badRequest,
      message: BallotPaperCandidateValidationErrorMessage.validationError,
    };
  }

  const validationError = await defaultChecksInsertableBallotPaperSectionCandidate(
    data.candidateId,
    electionId,
  );
  if (validationError !== null) {
    return validationError;
  }

  // candidate should not be linked to the ballot paper section already
  if (await isCandidateLinkedToBallotPaperSection(data.candidateId, ballotPaperSectionId)) {
    return {
      status: HttpStatusCode.badRequest,
      message: BallotPaperCandidateValidationErrorMessage.candidateAlreadyLinked,
    };
  }
  return data;
};

export const validateRemovableBallotPaperSectionCandidate = async (
  body: unknown,
  electionId: Selectable<DBElection>['id'],
  ballotPaperSectionId: Selectable<DBBallotPaperSection>['id'],
): Promise<RemovableBallotPaperSectionCandidate | BallotPaperCandidateValidationError> => {
  const { data, success } =
    await removableBallotPaperSectionCandidateObject.safeParseAsync(body);
  if (!success) {
    return {
      status: HttpStatusCode.badRequest,
      message: BallotPaperCandidateValidationErrorMessage.validationError,
    };
  }

  const validationError = await defaultChecksInsertableBallotPaperSectionCandidate(
    data.candidateId,
    electionId,
  );
  if (validationError !== null) {
    return validationError;
  }

  // candidate should be linked to the ballot paper section
  if (!(await isCandidateLinkedToBallotPaperSection(data.candidateId, ballotPaperSectionId))) {
    return {
      status: HttpStatusCode.badRequest,
      message: BallotPaperCandidateValidationErrorMessage.candidateNotLinked,
    };
  }

  return data;
};
