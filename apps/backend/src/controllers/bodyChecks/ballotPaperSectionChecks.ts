import type {
  BallotPaper as DBBallotPaper,
  BallotPaperSection as DBBallotPaperSection,
  Candidate as DBCandidate,
  Election as DBElection,
} from '@repo/db/types';
import {
  insertableBallotPaperSectionCandidateObject,
  insertableBallotPaperSectionObject,
  removableBallotPaperSectionCandidateObject,
  updateableBallotPaperSectionObject,
  zodErrorToResponse400,
  type InsertableBallotPaperSection,
  type InsertableBallotPaperSectionCandidate,
  type RemovableBallotPaperSectionCandidate,
  type UpdateableBallotPaperSection,
} from '@repo/votura-validators';
import type { Selectable } from 'kysely';
import { HttpStatusCode } from '../../httpStatusCode.js';
import { getBallotPaperMaxVotes } from '../../services/ballotPapers.service.js';
import {
  checkCandidateExists,
  isCandidateLinkedToBallotPaperSection,
  isElectionParentOfCandidate,
} from '../../services/candidates.service.js';
import type { BodyCheckValidationError } from './bodyCheckValidationError.js';

//----------- Ballot Paper Section Candidate Checks -----------
export enum BallotPaperCandidateValidationErrorMessage {
  candidateNotFound = 'Candidate not found.',
  electionNotParent = 'Candidate is not linked to the given election.',
  candidateAlreadyLinked = 'Candidate is already linked to the ballot paper section.',
  candidateNotLinked = 'Candidate is not linked to the ballot paper section.',
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
  const { data, error, success } =
    await insertableBallotPaperSectionCandidateObject.safeParseAsync(body);
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
  const { data, error, success } =
    await removableBallotPaperSectionCandidateObject.safeParseAsync(body);
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

  // candidate should be linked to the ballot paper section
  if (!(await isCandidateLinkedToBallotPaperSection(data.candidateId, ballotPaperSectionId))) {
    return {
      status: HttpStatusCode.badRequest,
      message: BallotPaperCandidateValidationErrorMessage.candidateNotLinked,
    };
  }

  return data;
};

//----------- Ballot Paper Section MaxVotes and MaxVotesPerCandidate Checks -----------
export enum BallotPaperSectionBodyCheckValidationErrorMessage {
  maxVotesExceeded = 'The max votes for the ballot paper section cannot be greater than the max votes of the ballot paper.',
  maxVotesPerCandidateExceeded = 'The max votes per candidate for the ballot paper section cannot be greater than the max votes per candidate of the ballot paper.',
}

export interface BallotPaperSectionBodyCheckValidationError extends BodyCheckValidationError {
  message: BallotPaperSectionBodyCheckValidationErrorMessage | string;
}

const defaultChecksBallotPaperSection = async (
  ballotPaperId: Selectable<DBBallotPaper>['id'],
  maxVotesBPS: Selectable<DBBallotPaperSection>['maxVotes'],
  maxVotesPerCandidateBPS: Selectable<DBBallotPaperSection>['maxVotesPerCandidate'],
): Promise<BallotPaperSectionBodyCheckValidationError | null> => {
  const { maxVotes: maxVotesBP, maxVotesPerCandidate: maxVotesPerCandidateBP } =
    await getBallotPaperMaxVotes(ballotPaperId);

  // check if max votes is not exceeded
  if (maxVotesBPS > maxVotesBP) {
    return {
      status: HttpStatusCode.badRequest,
      message: BallotPaperSectionBodyCheckValidationErrorMessage.maxVotesExceeded,
    };
  }

  // check if max votes per candidate is not exceeded
  if (maxVotesPerCandidateBPS > maxVotesPerCandidateBP) {
    return {
      status: HttpStatusCode.badRequest,
      message: BallotPaperSectionBodyCheckValidationErrorMessage.maxVotesPerCandidateExceeded,
    };
  }

  return null;
};

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
