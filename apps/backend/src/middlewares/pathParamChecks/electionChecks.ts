import type { Candidate as DBCandidate } from '@repo/db/types';
import {
  response403Object,
  response404Object,
  uuidObject,
  zodErrorToResponse400,
  type Election,
  type Response400,
  type Response403,
  type Response404,
  type SelectableUser,
} from '@repo/votura-validators';
import type { NextFunction, Request, Response } from 'express';
import type { Selectable } from 'kysely';
import { HttpStatusCode } from '../../httpStatusCode.js';
import { getBallotPapers } from '../../services/ballotPapers.service.js';
import { getBallotPaperSections } from '../../services/ballotPaperSections.service.js';
import { getCandidates } from '../../services/candidates.service.js';
import {
  checkElectionExists as checkElectionExistsService,
  getElectionVotingStart,
  isElectionFrozen,
  isElectionGeneratingKeys,
  isUserOwnerOfElection,
} from '../../services/elections.service.js';
import { setsEqual } from '../../utils.js';

/**
 * Checks if the election ID in the request parameters is a valid UUID.
 * If the UUID is invalid, it sends a 400 Bad Request response with the error details.
 * If the UUID is valid, it calls the next middleware function.
 *
 * @param req The request object containing the election ID as a path parameter.
 * @param res The response object to send errors to.
 * @param next The next middleware function to call if the UUID is valid.
 */
export async function checkElectionUuid(
  req: Request<{ electionId: string }>,
  res: Response<Response400>,
  next: NextFunction,
): Promise<void> {
  const parsedUuid = await uuidObject.safeParseAsync(req.params.electionId);

  if (!parsedUuid.success) {
    res.status(HttpStatusCode.badRequest).send(zodErrorToResponse400(parsedUuid.error));
  } else {
    next();
  }
}

/**
 * Checks if the election with the given ID in the request exists in the database.
 * If it does not exist, it sends a 404 Not Found response, otherwise it calls the next middleware function.
 *
 * @param req The request object containing the election ID as a path parameter.
 * @param res The response object to send errors to.
 * @param next The next middleware function to call if the election exists.
 */
export async function checkElectionExists(
  req: Request<{ electionId: Election['id'] }>,
  res: Response<Response404>,
  next: NextFunction,
): Promise<void> {
  if (!(await checkElectionExistsService(req.params.electionId))) {
    res.status(HttpStatusCode.notFound).json(
      response404Object.parse({
        message: 'The provided election does not exist!',
      }),
    );
  } else {
    next();
  }
}

const error403Response = (res: Response<Response403>, message: string): void => {
  res.status(HttpStatusCode.forbidden).json(response403Object.parse({ message }));
};

/**
 * Checks if the user is the owner of the election with the given ID.
 * If the user is not the owner, it sends a 403 Forbidden response.
 * If the user is the owner, it calls the next middleware function.
 *
 * @param req The request object containing the election ID and user ID as path parameters.
 * @param res The response object to send errors to.
 * @param next The next middleware function to call if the user is the owner.
 */
export async function checkUserOwnerOfElection(
  req: Request<{ electionId: Election['id'] }>,
  res: Response<Response403, { user: SelectableUser }>,
  next: NextFunction,
): Promise<void> {
  if (!(await isUserOwnerOfElection(req.params.electionId, res.locals.user.id))) {
    error403Response(res, 'You do not have the permission to access or modify this election.');
  } else {
    next();
  }
}

/**
 * Checks if the election with the given ID is frozen.
 * If the election is frozen, it sends a 403 Forbidden response.
 * If the election is not frozen, it calls the next middleware function.
 *
 * @param req The request object containing the election ID as a path parameter.
 * @param res The response object to send errors to.
 * @param next The next middleware function to call if the election is not frozen.
 */
export async function checkElectionNotFrozen(
  req: Request<{ electionId: Election['id'] }>,
  res: Response<Response403>,
  next: NextFunction,
): Promise<void> {
  if (await isElectionFrozen(req.params.electionId)) {
    error403Response(res, 'The election is frozen and cannot be modified.');
  } else {
    next();
  }
}

/**
 * Checks if a election is currently generating it's keys.
 * If the config of the election is frozen but the public key is still null the generation process is not finished.
 * If this is the case it sends a 403 else calls the next middleware function.
 *
 * @param req The request containing the validated election id.
 * @param res The response object to send any error.
 * @param next The next middleware function.
 */
export async function checkElectionNotGenerateKeys(
  req: Request<{ electionId: Election['id'] }>,
  res: Response<Response403>,
  next: NextFunction,
): Promise<void> {
  if (await isElectionGeneratingKeys(req.params.electionId)) {
    error403Response(
      res,
      'Currently the generation of the election keys are running. ' +
        'For consistency you are not allowed to do this action. ' +
        'Please retry in some minutes.',
    );
  } else {
    next();
  }
}

/**
 * Checks if the voting start date of the election with the given ID is in the future.
 * If the voting start date is in the past, it sends a 403 Forbidden response.
 * If the voting start date is in the future, it calls the next middleware function.
 *
 * @param req The request object containing the election ID as a path parameter.
 * @param res The response object to send errors to.
 * @param next The next middleware function to call if the election is not frozen.
 */
export async function checkVotingStartInFuture(
  req: Request<{ electionId: Election['id'] }>,
  res: Response<Response403>,
  next: NextFunction,
): Promise<void> {
  const votingStart = await getElectionVotingStart(req.params.electionId);

  if (votingStart < new Date()) {
    error403Response(
      res,
      'The voting start date is in the past. ' +
        'You are only allowed to do this action if the voting start date is in the future.',
    );
  } else {
    next();
  }
}

export enum CheckElectionIsValidErrors {
  noBallotPapers = 'noBallotPapers',
  noSections = 'noSections',
  noCandidates = 'noCandidates',
  candidateMismatch = 'candidateMismatch',
}
type CheckElectionIsValidErrorsWithoutId =
  | CheckElectionIsValidErrors.noBallotPapers
  | CheckElectionIsValidErrors.candidateMismatch;
type CheckElectionIsValidErrorsWithId =
  | CheckElectionIsValidErrors.noSections
  | CheckElectionIsValidErrors.noCandidates;

export function getValidationErrorMessage(error: CheckElectionIsValidErrorsWithoutId): string;
export function getValidationErrorMessage(
  error: CheckElectionIsValidErrorsWithId,
  id: string,
): string;
export function getValidationErrorMessage(error: CheckElectionIsValidErrors, id?: string): string {
  switch (error) {
    case CheckElectionIsValidErrors.noBallotPapers:
      return 'The election must have at least one ballot paper.';
    case CheckElectionIsValidErrors.noSections:
      return `The ballot paper with ID ${id} must have at least one section.`;
    case CheckElectionIsValidErrors.noCandidates:
      return `The ballot paper section with ID ${id} must have at least one candidate linked to it.`;
    case CheckElectionIsValidErrors.candidateMismatch:
      return 'The candidates linked to the ballot paper sections must be the same as the candidates linked to the election. Most likely a candidate linked to the election is not linked to any ballot paper section.';
    default:
      return 'Unknown validation error';
  }
}

/**
 * Checks if an election is valid by verifying the following conditions:
 * 1. At least one ballot paper is linked to the election.
 * 2. Each ballot paper has at least one section linked to it.
 * 3. Each ballot paper section has at least one candidate linked to it.
 * 4. The candidates linked to the ballot paper sections must be the same as the candidates linked to the election. Every candidate linked to the election must be linked to at least one ballot paper section.
 *
 * @param req The request object containing the election ID.
 * @param res The response object to send errors to.
 * @param next The next middleware function to call if the election is valid.
 */
export async function checkElectionIsValid(
  req: Request<{ electionId: Election['id'] }>,
  res: Response<Response403>,
  next: NextFunction,
): Promise<void> {
  // Check at least one ballot paper is linked to the election
  const ballotPapers = await getBallotPapers(req.params.electionId);
  if (ballotPapers.length === 0) {
    error403Response(res, getValidationErrorMessage(CheckElectionIsValidErrors.noBallotPapers));
    return;
  }

  // Check ballot papers have at least one section linked to them
  // and that each section has at least one candidate linked to it
  const bpsCandidateIds = new Set<Selectable<DBCandidate>['id']>();
  for (const ballotPaper of ballotPapers) {
    const sections = await getBallotPaperSections(ballotPaper.id);
    if (sections.length === 0) {
      error403Response(
        res,
        getValidationErrorMessage(CheckElectionIsValidErrors.noSections, ballotPaper.id),
      );
      return;
    }

    for (const section of sections) {
      if (section.candidateIds.length === 0) {
        error403Response(
          res,
          getValidationErrorMessage(CheckElectionIsValidErrors.noCandidates, section.id),
        );
        return;
      }
      section.candidateIds.forEach((id) => bpsCandidateIds.add(id));
    }
  }

  // Check that the candidates linked to the ballot paper sections are the same as the candidates linked to the election
  const electionCandidateIds = new Set(
    (await getCandidates(req.params.electionId)).map((candidate) => candidate.id),
  );
  if (!setsEqual(bpsCandidateIds, electionCandidateIds)) {
    error403Response(res, getValidationErrorMessage(CheckElectionIsValidErrors.candidateMismatch));
    return;
  }

  next();
}

export const defaultElectionChecks = [
  checkElectionUuid,
  checkElectionExists,
  checkUserOwnerOfElection,
];
