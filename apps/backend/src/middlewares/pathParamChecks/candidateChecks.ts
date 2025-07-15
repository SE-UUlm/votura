import { db } from '@repo/db';
import {
  insertableBallotPaperSectionCandidateObject,
  removableBallotPaperSectionCandidateObject,
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

/**
 * Checks if the candidate ID in the request parameters is a valid UUID.
 * If the UUID is invalid, it sends a 400 Bad Request response with the error details.
 * If the UUID is valid, it calls the next middleware function.
 *
 * @param req The request object containing the candidate ID as a path parameter.
 * @param res The response object to send errors to.
 * @param next The next middleware function to call if the UUID is valid.
 */
export async function checkCandidateUuidParam(
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
 * Checks if the body of the request is a valid insertableBallotPaperSectionCandidate object.
 * If the body is invalid, it sends a 400 Bad Request response with the error details.
 * If the body is valid, it sets the candidateId in response locals and calls the next middleware function.
 *
 * @param req The request object containing the body with candidateId.
 * @param res The response object to send errors to, and to set the candidateId in locals.
 * @param next The next middleware function to call if the body is valid.
 */
export async function checkCandidateUuidBodyInsertable(
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
export async function checkCandidateUuidBodyRemovable(
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
 * Checks if a candidate with the given ID exists in the database.
 * If the candidate does not exist, it sends a 404 Not Found response with an error message.
 * If the candidate exists, it calls the next middleware function.
 *
 * @param candidateId The ID of the candidate to check for existence.
 * @param res The response object to send errors to.
 * @param next The next middleware function to call if the candidate exists.
 */
export async function checkCandidateExists(
  candidateId: Candidate['id'],
  res: Response<Response404>,
  next: NextFunction,
): Promise<void> {
  const result = await db
    .selectFrom('candidate')
    .select(['id'])
    .where('id', '=', candidateId)
    .executeTakeFirst();

  if (result === undefined) {
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
 * Wrapper function for checkCandidateExists that checks if a candidate with the given ID in the request parameters exists.
 * If it does not exist, it sends a 404 Not Found response, otherwise it calls the next middleware function.
 *
 * @param req The request object containing the candidate ID as a path parameter.
 * @param res The response object to send errors to.
 * @param next The next middleware function to call if the candidate exists.
 */
export async function checkCandidateExistsParam(
  req: Request<{ candidateId: Candidate['id'] }>,
  res: Response<Response404>,
  next: NextFunction,
): Promise<void> {
  await checkCandidateExists(req.params.candidateId, res, next);
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
export async function checkCandidateExistsBody(
  _req: Request,
  res: Response<Response404, { candidateId?: string }>,
  next: NextFunction,
): Promise<void> {
  if (res.locals.candidateId === undefined) {
    throw new Error('Candidate ID is not set in response locals');
  }

  await checkCandidateExists(res.locals.candidateId, res, next);
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
export async function checkElectionIsParent(
  electionId: Election['id'],
  candidateId: Candidate['id'],
  res: Response<Response400>,
  next: NextFunction,
): Promise<void> {
  const result = await db
    .selectFrom('candidate')
    .select(['id', 'electionId'])
    .where('id', '=', candidateId)
    .where('electionId', '=', electionId)
    .executeTakeFirst();

  if (result === undefined) {
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
 * Wrapper function for checkElectionIsParent that checks if the candidate with the given ID in the request parameters belongs to the election with the given ID.
 * If it does not belong, it sends a 400 Bad Request response, otherwise it calls the next middleware function.
 *
 * @param req The request object containing the candidate and election ID as a path parameter.
 * @param res The response object to send errors to.
 * @param next The next middleware function to call if the candidate belongs to the election.
 */
export async function checkElectionIsParentParam(
  req: Request<{ electionId: Election['id']; candidateId: Candidate['id'] }>,
  res: Response<Response400>,
  next: NextFunction,
): Promise<void> {
  await checkElectionIsParent(req.params.electionId, req.params.candidateId, res, next);
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
export async function checkElectionIsParentBody(
  req: Request<{ electionId: Election['id'] }>,
  res: Response<Response400, { candidateId?: string }>,
  next: NextFunction,
): Promise<void> {
  if (res.locals.candidateId === undefined) {
    throw new Error('Candidate ID is not set in response locals');
  }

  await checkElectionIsParent(req.params.electionId, res.locals.candidateId, res, next);
}

export const defaultCandidateChecksParam = [
  checkCandidateUuidParam,
  checkCandidateExistsParam,
  checkElectionIsParentParam,
];

export const defaultCandidateChecksBody = [checkCandidateExistsBody, checkElectionIsParentBody];
