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
  type Uuid,
} from '@repo/votura-validators';
import type { NextFunction, Request, Response } from 'express';
import { HttpStatusCode } from '../httpStatusCode.js';
import { exitsBallotPaper, isElectionParent } from './checkFunctions/ballotPaperCheck.js';
import { exitsElection, isValidOwnerOfElection } from './checkFunctions/electionCheck.js';

/**
 * Validates if the provided UUID is a valid UUID string.
 * If the UUID is invalid, sends a 400 Bad Request response.
 *
 * @param {unknown} uuid The UUID to validate.
 * @param {Response} res The response object to send errors to.
 * @returns {Promise<null | Uuid>} A promise that resolves to the parsed UUID if valid, or null if invalid.
 */
const validUuid = async (uuid: unknown, res: Response): Promise<null | Uuid> => {
  const parsedUuid = await uuidObject.safeParseAsync(uuid);

  if (parsedUuid.success === false) {
    res.status(HttpStatusCode.BadRequest).send(zodErrorToResponse400(parsedUuid.error));
    return null;
  }
  return parsedUuid.data;
};

/**
 * Checks the electionId path parameter in the request.
 * 1. Checks if the electionId is a valid UUID.
 * 2. Checks if the election exists in the database.
 * 3. Checks if the user is the owner of the election.
 * If any of these checks fail, it sends an appropriate error response.
 *
 * @param req The request object.
 * @param res The response object.
 * @param next The next middleware function.
 * @returns A promise that resolves when the checks are complete.
 */
export const electionIdCheck = async (
  req: Request<{ electionId: string }>,
  res: Response<Response400 | Response403 | Response404, { user: SelectableUser }>,
  next: NextFunction,
): Promise<void> => {
  const electionId = await validUuid(req.params.electionId, res);
  if (electionId === null) {
    return;
  }

  const exists = await exitsElection(electionId);
  if (exists === false) {
    res.status(HttpStatusCode.NotFound).json(
      response404Object.parse({
        message: 'The provided election uuid does not exist!',
      }),
    );
    return;
  }

  const isValidOwner = await isValidOwnerOfElection(electionId, res.locals.user.id);
  if (isValidOwner === false) {
    res
      .status(HttpStatusCode.Forbidden)
      .json(
        response403Object.parse({ message: 'You do not have permission to access this election.' }),
      );
    return;
  }

  next();
};

/**
 * Checks the ballotPaperId path parameter in the request.
 * 1. Checks if the ballotPaperId is a valid UUID.
 * 2. Checks if the ballot paper exists in the database.
 * 3. Checks if the ballot paper belongs to the electionId of the request.
 * If any of these checks fail, it sends an appropriate error response.
 *
 * @param req The request object.
 * @param res The response object.
 * @param next The next middleware function.
 * @returns A promise that resolves when the checks are complete.
 */
export const ballotPaperIdCheck = async (
  req: Request<{ electionId: Election['id']; ballotPaperId: string }>,
  res: Response<Response400 | Response403 | Response404, { user: SelectableUser }>,
  next: NextFunction,
): Promise<void> => {
  const ballotPaperId = await validUuid(req.params.ballotPaperId, res);
  if (ballotPaperId === null) {
    return;
  }

  const exists = await exitsBallotPaper(ballotPaperId);
  if (exists !== true) {
    res.status(HttpStatusCode.NotFound).json(
      response404Object.parse({
        message: 'The provided ballot paper uuid does not exist!',
      }),
    );
    return;
  }

  const isParent = await isElectionParent(ballotPaperId, req.params.electionId);
  if (isParent !== true) {
    res.status(HttpStatusCode.NotFound).json(
      response404Object.parse({
        message: 'The provided ballot paper does not belong to the provided election.',
      }),
    );
    return;
  }

  next();
};
