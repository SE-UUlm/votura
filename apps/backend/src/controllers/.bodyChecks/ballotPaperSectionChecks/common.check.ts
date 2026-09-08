import type {
  BallotPaper as DBBallotPaper,
  BallotPaperSection as DBBallotPaperSection,
  Candidate as DBCandidate,
  Election as DBElection,
} from '@repo/db/types';
import type { Selectable } from 'kysely';
import { HttpStatusCode } from '../../../httpStatusCode.js';
import { getBallotPaperMaxVotes } from '../../../services/ballotPapers.service.js';
import {
  checkCandidateExists,
  isElectionParentOfCandidate,
} from '../../../services/candidates.service.js';
import type { BodyCheckValidationError } from '../bodyCheckValidationError.js';

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

// TODO: TSDoc
export const defaultChecksInsertableBallotPaperSectionCandidate = async (
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

//----------- Ballot Paper Section Checks -----------
export enum BallotPaperSectionBodyCheckValidationErrorMessage {
  maxVotesExceeded = 'The max votes for the ballot paper section cannot be greater than the max votes of the ballot paper.',
  maxVotesPerCandidateExceeded = 'The max votes per candidate for the ballot paper section cannot be greater than the max votes per candidate of the ballot paper.',
}

export interface BallotPaperSectionBodyCheckValidationError extends BodyCheckValidationError {
  message: BallotPaperSectionBodyCheckValidationErrorMessage | string;
}

// TODO: TSDoc
export const defaultChecksBallotPaperSection = async (
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
