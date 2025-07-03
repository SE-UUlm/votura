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
import { db } from '../../db/database.js';
import { HttpStatusCode } from '../../httpStatusCode.js';

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
    res.status(HttpStatusCode.BadRequest).send(zodErrorToResponse400(parsedUuid.error));
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
  const result = await db
    .selectFrom('Election')
    .select(['id'])
    .where('id', '=', req.params.electionId)
    .executeTakeFirst();

  if (result === undefined) {
    res.status(HttpStatusCode.NotFound).json(
      response404Object.parse({
        message: 'The provided election does not exist!',
      }),
    );
  } else {
    next();
  }
}

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
  const result = await db
    .selectFrom('Election')
    .select(['id', 'electionCreatorId'])
    .where('id', '=', req.params.electionId)
    .where('electionCreatorId', '=', res.locals.user.id)
    .executeTakeFirst();

  if (result === undefined) {
    res.status(HttpStatusCode.Forbidden).json(
      response403Object.parse({
        message: 'You do not have the permission to access or modify this election.',
      }),
    );
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
  res: Response<Response403 | Response404>,
  next: NextFunction,
): Promise<void> {
  const result = await db
    .selectFrom('Election')
    .select(['id', 'configFrozen'])
    .where('id', '=', req.params.electionId)
    .executeTakeFirst();

  if (result === undefined) {
    res.status(HttpStatusCode.NotFound).json(
      response404Object.parse({
        message: 'The provided election does not exist!',
      }),
    );
  } else if (result.configFrozen) {
    res.status(HttpStatusCode.Forbidden).json(
      response403Object.parse({
        message: 'The election is frozen and cannot be modified.',
      }),
    );
  } else {
    next();
  }
}

export const defaultElectionChecks = [
  checkElectionUuid,
  checkElectionExists,
  checkUserOwnerOfElection,
];
