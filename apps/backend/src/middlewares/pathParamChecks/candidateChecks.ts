import {
  response400Object,
  response404Object,
  uuidObject,
  zodErrorToResponse400,
  type Candidate,
  type Election,
  type Response400,
  type Response404,
} from '@repo/votura-validators';
import type { NextFunction, Request, Response } from 'express';
import { HttpStatusCode } from '../../httpStatusCode.js';
import {
  checkCandidateExists as checkCandidateExistsService,
  isElectionParentOfCandidate,
} from '../../services/candidates.service.js';

/**
 * Checks if the candidate ID in the request parameters is a valid UUID.
 * If the UUID is invalid, it sends a 400 Bad Request response with the error details.
 * If the UUID is valid, it calls the next middleware function.
 *
 * @param req The request object containing the candidate ID as a path parameter.
 * @param res The response object to send errors to.
 * @param next The next middleware function to call if the UUID is valid.
 */
export async function checkCandidateUuid(
  req: Request<{ candidateId: string }>,
  res: Response<Response400>,
  next: NextFunction,
): Promise<void> {
  const parsedUuid = await uuidObject.safeParseAsync(req.params.candidateId);

  if (!parsedUuid.success) {
    res.status(HttpStatusCode.badRequest).send(zodErrorToResponse400(parsedUuid.error));
  } else {
    next();
  }
}

/**
 * Checks if a candidate with the given ID exists in the database.
 * If the candidate does not exist, it sends a 404 Not Found response with an error message.
 * If the candidate exists, it calls the next middleware function.
 *
 * @param candidateId The ID of the candidate to check for existence.
 * @param res The response object to send errors to.
 * @param next The next middleware function to call if the candidate exists.
 */
export async function checkCandidateExistsHelper(
  candidateId: Candidate['id'],
  res: Response<Response404>,
  next: NextFunction,
): Promise<void> {
  if (!(await checkCandidateExistsService(candidateId))) {
    res.status(HttpStatusCode.notFound).json(
      response404Object.parse({
        message: 'The provided candidate does not exist!',
      }),
    );
  } else {
    next();
  }
}

/**
 * Wrapper function for checkCandidateExistsHelper that checks if a candidate with the given ID in the request parameters exists.
 * If it does not exist, it sends a 404 Not Found response, otherwise it calls the next middleware function.
 *
 * @param req The request object containing the candidate ID as a path parameter.
 * @param res The response object to send errors to.
 * @param next The next middleware function to call if the candidate exists.
 */
export async function checkCandidateExists(
  req: Request<{ candidateId: Candidate['id'] }>,
  res: Response<Response404>,
  next: NextFunction,
): Promise<void> {
  await checkCandidateExistsHelper(req.params.candidateId, res, next);
}

/**
 * Checks if the candidate with the given ID belongs to the election with the given ID.
 * If the candidate does not belong to the election, it sends a 400 Bad Request response with an error message.
 * If the candidate belongs to the election, it calls the next middleware function.
 *
 * @param electionId The ID of the election to check against.
 * @param candidateId The ID of the candidate to check.
 * @param res The response object to send errors to.
 * @param next The next middleware function to call if the candidate belongs to the election.
 */
export async function checkElectionIsParentHelper(
  electionId: Election['id'],
  candidateId: Candidate['id'],
  res: Response<Response400>,
  next: NextFunction,
): Promise<void> {
  if (!(await isElectionParentOfCandidate(electionId, candidateId))) {
    res.status(HttpStatusCode.badRequest).json(
      response400Object.parse({
        message: 'The provided candidate does not belong to the provided election.',
      }),
    );
  } else {
    next();
  }
}

/**
 * Wrapper function for checkElectionIsParentHelper that checks if the candidate with the given ID in the request parameters belongs to the election with the given ID.
 * If it does not belong, it sends a 400 Bad Request response, otherwise it calls the next middleware function.
 *
 * @param req The request object containing the candidate and election ID as a path parameter.
 * @param res The response object to send errors to.
 * @param next The next middleware function to call if the candidate belongs to the election.
 */
export async function checkElectionIsParent(
  req: Request<{ electionId: Election['id']; candidateId: Candidate['id'] }>,
  res: Response<Response400>,
  next: NextFunction,
): Promise<void> {
  await checkElectionIsParentHelper(req.params.electionId, req.params.candidateId, res, next);
}

export const defaultCandidateChecks = [
  checkCandidateUuid,
  checkCandidateExists,
  checkElectionIsParent,
];
