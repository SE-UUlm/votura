import {
  insertableBallotPaperSectionCandidateObject,
  removableBallotPaperSectionCandidateObject,
  zodErrorToResponse400,
  type BallotPaperSection,
  type Election,
  type Response400,
  type Response404,
} from '@repo/votura-validators';
import type { NextFunction, Request, Response } from 'express';
import { response400Object } from '../../../../../packages/votura-validators/dist/objects/response.js';
import { HttpStatusCode } from '../../httpStatusCode.js';
import { isCandidateLinkedToBallotPaperSection } from '../../services/candidates.service.js';
import {
  checkCandidateExistsHelper,
  checkElectionIsParentHelper,
} from '../pathParamChecks/candidateChecks.js';

/**
 * Checks if the body of the request is a valid insertableBallotPaperSectionCandidate object.
 * If the body is invalid, it sends a 400 Bad Request response with the error details.
 * If the body is valid, it sets the candidateId in response locals and calls the next middleware function.
 *
 * @param req The request object containing the body with candidateId.
 * @param res The response object to send errors to, and to set the candidateId in locals.
 * @param next The next middleware function to call if the body is valid.
 */
export async function checkCandidateUuidInsertable(
  req: Request,
  res: Response<Response400, { candidateId?: string }>,
  next: NextFunction,
): Promise<void> {
  const { data, error, success } = await insertableBallotPaperSectionCandidateObject.safeParseAsync(
    req.body,
  );

  if (success === false) {
    res.status(HttpStatusCode.badRequest).send(zodErrorToResponse400(error));
    return;
  }
  res.locals.candidateId = data.candidateId;
  next();
}

/**
 * Checks if the body of the request is a valid removableBallotPaperSectionCandidate object.
 * If the body is invalid, it sends a 400 Bad Request response with the error details.
 * If the body is valid, it sets the candidateId in response locals and calls the next middleware function.
 *
 * @param req The request object containing the body with candidateId.
 * @param res The response object to send errors to, and to set the candidateId in locals.
 * @param next The next middleware function to call if the body is valid.
 */
export async function checkCandidateUuidRemovable(
  req: Request,
  res: Response<Response400, { candidateId?: string }>,
  next: NextFunction,
): Promise<void> {
  const { data, error, success } = await removableBallotPaperSectionCandidateObject.safeParseAsync(
    req.body,
  );

  if (success === false) {
    res.status(HttpStatusCode.badRequest).send(zodErrorToResponse400(error));
    return;
  }
  res.locals.candidateId = data.candidateId;
  next();
}

/**
 * Wrapper function for checkCandidateExists that checks if a candidate with the given ID in the response locals exists.
 * Is intended to be used when the candidate ID is set in the response locals by a previous middleware.
 * If the candidate ID is not set, it throws an error.
 *
 * @param _req The request object, not used in this function.
 * @param res The response object to send errors to, and to check the candidate ID in locals.
 * @param next The next middleware function to call if the candidate exists.
 */
export async function checkCandidateExists(
  _req: Request,
  res: Response<Response404, { candidateId?: string }>,
  next: NextFunction,
): Promise<void> {
  if (res.locals.candidateId === undefined) {
    throw new Error('Candidate ID is not set in response locals');
  }

  await checkCandidateExistsHelper(res.locals.candidateId, res, next);
}

/**
 * Wrapper function for checkElectionIsParent that checks if the candidate with the given ID in the response locals belongs to the election with the given ID.
 * Is intended to be used when the candidate ID is set in the response locals by a previous middleware.
 * If the candidate ID is not set, it throws an error.
 *
 * @param req The request object, containing the election ID as a path parameter.
 * @param res The response object to send errors to, and to check the candidate ID in locals.
 * @param next The next middleware function to call if the candidate belongs to the election.
 */
export async function checkElectionIsParent(
  req: Request<{ electionId: Election['id'] }>,
  res: Response<Response400, { candidateId?: string }>,
  next: NextFunction,
): Promise<void> {
  if (res.locals.candidateId === undefined) {
    throw new Error('Candidate ID is not set in response locals');
  }

  await checkElectionIsParentHelper(req.params.electionId, res.locals.candidateId, res, next);
}

export async function checkCandidateNotLinkedToBallotPaperSection(
  req: Request<{ ballotPaperSectionId: BallotPaperSection['id'] }>,
  res: Response<Response400, { candidateId?: string }>,
  next: NextFunction,
): Promise<void> {
  if (res.locals.candidateId === undefined) {
    throw new Error('Candidate ID is not set in response locals');
  }
  if (
    await isCandidateLinkedToBallotPaperSection(
      res.locals.candidateId,
      req.params.ballotPaperSectionId,
    )
  ) {
    res.status(HttpStatusCode.badRequest).json(
      response400Object.parse({
        message: 'The provided candidate is already linked to the ballot paper section.',
      }),
    );
  } else {
    next();
  }
}

export const defaultBallotPaperSectionCandidateChecks = [
  checkCandidateExists,
  checkElectionIsParent,
];
