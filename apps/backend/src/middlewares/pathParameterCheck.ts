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
import {
  exitsElection,
  isElectionFrozen,
  isValidOwnerOfElection,
} from './checkFunctions/electionCheck.js';
import { validUuid } from './checkFunctions/globalChecks.js';

/**
 * Checks the electionId path parameter in the request.
 * 1. Checks if the electionId is a valid UUID.
 * 2. Checks if the election exists in the database.
 * 3. Checks if the user is the owner of the election.
 * 4. Optionally checks if the election is frozen (if `electionUnfrozen` is `true`),
 * so that it can be blocked from modifications.
 * If the `electionUnfrozen` parameter is `false`, it skips the frozen check.
 *
 * If any of these checks fail, it sends an appropriate error response.
 *
 * @param electionUnfrozen Whether the election needs to be unfrozen to proceed.
 * @param req The request object.
 * @param res The response object.
 * @param next The next middleware function.
 * @returns A promise that resolves when the checks are complete.
 */
export const electionIdCheck =
  (electionUnfrozen: boolean) =>
  async (
    req: Request<{ electionId: string }>,
    res: Response<Response400 | Response403 | Response404, { user: SelectableUser }>,
    next: NextFunction,
  ): Promise<void> => {
    const electionId = await validUuid(req.params.electionId, res);
    if (electionId === null) {
      return;
    }

    const exists = await exitsElection(electionId, res);
    if (!exists) {
      return;
    }

    const isValidOwner = await isValidOwnerOfElection(electionId, res.locals.user.id, res);
    if (!isValidOwner) {
      return;
    }

    if (electionUnfrozen) {
      const electionIsFrozen = await isElectionFrozen(electionId, res);
      if (electionIsFrozen === true || electionIsFrozen === null) {
        return;
      }
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
