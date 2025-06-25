import {
  response403Object,
  response404Object,
  type Election,
  type User,
} from '@repo/votura-validators';
import type { Response } from 'express';
import { db } from '../../db/database.js';
import { HttpStatusCode } from '../../httpStatusCode.js';

/**
 * Checks if the election with the given ID exists in the database.
 * If it does not exist, it sends a 404 Not Found response.
 *
 * @param electionId The ID of the election to check.
 * @param res The response object to send errors to.
 * @returns A promise that resolves to true if the election exists, or false if it does not.
 */
export async function exitsElection(electionId: Election['id'], res: Response): Promise<boolean> {
  const result = await db
    .selectFrom('Election')
    .select(['id'])
    .where('id', '=', electionId)
    .executeTakeFirst();

  if (result === undefined) {
    res.status(HttpStatusCode.NotFound).json(
      response404Object.parse({
        message: 'The provided election uuid does not exist!',
      }),
    );
    return false;
  }
  return true;
}

/**
 * Checks if the user is the owner of the election with the given ID.
 * If the user is not the owner, it sends a 403 Forbidden response.
 *
 * @param electionId The ID of the election to check.
 * @param userId The ID of the user to check.
 * @param res The response object to send errors to.
 * @returns A promise that resolves to true if the user is the owner, or false if not.
 */
export async function isValidOwnerOfElection(
  electionId: Election['id'],
  userId: User['id'],
  res: Response,
): Promise<boolean> {
  const result = await db
    .selectFrom('Election')
    .select(['id', 'electionCreatorId'])
    .where('id', '=', electionId)
    .where('electionCreatorId', '=', userId)
    .executeTakeFirst();

  if (result === undefined) {
    res.status(HttpStatusCode.Forbidden).json(
      response403Object.parse({
        message: 'You do not have permission to access this election.',
      }),
    );
    return false;
  }
  return true;
}

/**
 * Checks if the election with the given ID is unfrozen.
 * If the election is frozen, it sends a 403 Forbidden response.
 *
 * @param electionId The ID of the election to check.
 * @param res The response object to send errors to.
 * @returns A promise that resolves to true if the election is unfrozen, or false if it is frozen.
 */
export async function isElectionUnfrozen(
  electionId: Election['id'],
  res: Response,
): Promise<boolean> {
  const result = await db
    .selectFrom('Election')
    .select(['id', 'configFrozen'])
    .where('id', '=', electionId)
    .executeTakeFirst();

  if (result === undefined) {
    res.status(HttpStatusCode.NotFound).json(
      response404Object.parse({
        message: 'The election was not found.',
      }),
    );
    return false;
  }

  if (result.configFrozen !== false) {
    res.status(HttpStatusCode.Forbidden).json(
      response403Object.parse({
        message: 'The election is frozen and cannot be modified.',
      }),
    );
    return false;
  }

  return true;
}
