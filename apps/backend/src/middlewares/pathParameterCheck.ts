import {
  response404Object,
  type Election,
  type Response400,
  type Response403,
  type Response404,
  type SelectableUser,
} from '@repo/votura-validators';
import type { NextFunction, Request, Response } from 'express';
import { HttpStatusCode } from '../httpStatusCode.js';
import { exitsBallotPaper, isElectionParent } from './checkFunctions/ballotPaperCheck.js';
import { validateUuid } from './checkFunctions/globalChecks.js';

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
  const ballotPaperId = await validateUuid(req.params.ballotPaperId, res);
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
