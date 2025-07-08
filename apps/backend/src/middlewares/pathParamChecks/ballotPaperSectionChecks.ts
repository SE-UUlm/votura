import {
  response400Object,
  response404Object,
  uuidObject,
  zodErrorToResponse400,
  type BallotPaper,
  type BallotPaperSection,
  type Election,
  type Response400,
  type Response404,
} from '@repo/votura-validators';
import type { NextFunction, Request, Response } from 'express';
import { db } from '../../db/database.js';
import { HttpStatusCode } from '../../httpStatusCode.js';

/**
 * Checks if the ballot paper section ID in the request parameters is a valid UUID.
 * If the UUID is invalid, it sends a 400 Bad Request response with the error details.
 * If the UUID is valid, it calls the next middleware function.
 *
 * @param req The request object containing the ballot paper section ID as a path parameter.
 * @param res The response object to send errors to.
 * @param next The next middleware function to call if the UUID is valid.
 */
export async function checkBallotPaperSectionUuid(
  req: Request<{ ballotPaperSectionId: string }>,
  res: Response<Response400>,
  next: NextFunction,
): Promise<void> {
  const parsedUuid = await uuidObject.safeParseAsync(req.params.ballotPaperSectionId);

  if (!parsedUuid.success) {
    res.status(HttpStatusCode.badRequest).send(zodErrorToResponse400(parsedUuid.error));
  } else {
    next();
  }
}

/**
 * Checks if the ballot paper section with the given ID in the request exists in the database.
 * If it does not exist, it sends a 404 Not Found response, otherwise it calls the next middleware function.
 *
 * @param req The request object containing the ballot paper section ID as a path parameter.
 * @param res The response object to send errors to.
 * @param next The next middleware function to call if the ballot paper section exists.
 */
export async function checkBallotPaperSectionExists(
  req: Request<{ ballotPaperSectionId: BallotPaperSection['id'] }>,
  res: Response<Response404>,
  next: NextFunction,
): Promise<void> {
  const result = await db
    .selectFrom('ballotPaperSection')
    .select(['id'])
    .where('id', '=', req.params.ballotPaperSectionId)
    .executeTakeFirst();

  if (result === undefined) {
    res.status(HttpStatusCode.notFound).json(
      response404Object.parse({
        message: 'The provided ballot paper section does not exist!',
      }),
    );
  } else {
    next();
  }
}

/**
 * Checks if the ballot paper section with the given ID in the request belongs to the given ballot paper ID.
 * If it is not the case, it sends a 400 Bad Request response, otherwise it calls the next middleware function.
 *
 * @param req The request object containing the ballot paper section and ballot paper ID as a path parameter.
 * @param res The response object to send errors to.
 * @param next The next middleware function to call if the ballot paper section belongs to the ballot paper.
 */
export async function checkBallotPaperIsParent(
  req: Request<{
    electionId: Election['id'];
    ballotPaperId: BallotPaper['id'];
    ballotPaperSectionId: BallotPaperSection['id'];
  }>,
  res: Response<Response400>,
  next: NextFunction,
): Promise<void> {
  const result = await db
    .selectFrom('ballotPaperSection')
    .select(['id', 'ballotPaperId'])
    .where('id', '=', req.params.ballotPaperSectionId)
    .where('ballotPaperId', '=', req.params.ballotPaperId)
    .executeTakeFirst();

  if (result === undefined) {
    res.status(HttpStatusCode.badRequest).json(
      response400Object.parse({
        message: 'The provided ballot paper section does not belong to the provided ballot paper.',
      }),
    );
  } else {
    next();
  }
}

export const defaultBallotPaperSectionChecks = [
  checkBallotPaperSectionUuid,
  checkBallotPaperSectionExists,
  checkBallotPaperIsParent,
];
