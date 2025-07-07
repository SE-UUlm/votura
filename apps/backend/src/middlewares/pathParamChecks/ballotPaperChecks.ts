import { db } from '@repo/db';
import {
  response400Object,
  response404Object,
  uuidObject,
  zodErrorToResponse400,
  type BallotPaper,
  type Election,
  type Response400,
  type Response404,
} from '@repo/votura-validators';
import type { NextFunction, Request, Response } from 'express';
import { HttpStatusCode } from '../../httpStatusCode.js';

/**
 * Checks if the ballot paper ID in the request parameters is a valid UUID.
 * If the UUID is invalid, it sends a 400 Bad Request response with the error details.
 * If the UUID is valid, it calls the next middleware function.
 *
 * @param req The request object containing the ballot paper ID as a path parameter.
 * @param res The response object to send errors to.
 * @param next The next middleware function to call if the UUID is valid.
 */
export async function checkBallotPaperUuid(
  req: Request<{ ballotPaperId: string }>,
  res: Response<Response400>,
  next: NextFunction,
): Promise<void> {
  const parsedUuid = await uuidObject.safeParseAsync(req.params.ballotPaperId);

  if (!parsedUuid.success) {
    res.status(HttpStatusCode.BadRequest).send(zodErrorToResponse400(parsedUuid.error));
  } else {
    next();
  }
}

/**
 * Checks if the ballot paper with the given ID in the request exists in the database.
 * If it does not exist, it sends a 404 Not Found response, otherwise it calls the next middleware function.
 *
 * @param req The request object containing the ballot paper ID as a path parameter.
 * @param res The response object to send errors to.
 * @param next The next middleware function to call if the ballot paper exists.
 */
export async function checkBallotPaperExists(
  req: Request<{ ballotPaperId: BallotPaper['id'] }>,
  res: Response<Response404>,
  next: NextFunction,
): Promise<void> {
  const result = await db
    .selectFrom('BallotPaper')
    .select(['id'])
    .where('id', '=', req.params.ballotPaperId)
    .executeTakeFirst();

  if (result === undefined) {
    res.status(HttpStatusCode.NotFound).json(
      response404Object.parse({
        message: 'The provided ballot paper does not exist!',
      }),
    );
  } else {
    next();
  }
}

/**
 * Checks if the ballot paper with the given ID in the request belongs to the given election ID.
 * If it is not the case, it sends a 400 Bad Request response, otherwise it calls the next middleware function.
 *
 * @param req The request object containing the ballot paper and election ID as a path parameter.
 * @param res The response object to send errors to.
 * @param next The next middleware function to call if the ballot paper exists.
 */
export async function checkElectionIsParent(
  req: Request<{ electionId: Election['id']; ballotPaperId: BallotPaper['id'] }>,
  res: Response<Response400>,
  next: NextFunction,
): Promise<void> {
  const result = await db
    .selectFrom('BallotPaper')
    .select(['id', 'electionId'])
    .where('id', '=', req.params.ballotPaperId)
    .where('electionId', '=', req.params.electionId)
    .executeTakeFirst();

  if (result === undefined) {
    res.status(HttpStatusCode.BadRequest).json(
      response400Object.parse({
        message: 'The provided ballot paper does not belong to the provided election.',
      }),
    );
  } else {
    next();
  }
}

export const defaultBallotPaperChecks = [
  checkBallotPaperUuid,
  checkBallotPaperExists,
  checkElectionIsParent,
];
