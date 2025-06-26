import { uuidObject, zodErrorToResponse400, type Uuid } from '@repo/votura-validators';
import type { Response } from 'express';
import { HttpStatusCode } from '../../httpStatusCode.js';

/**
 * Validates the provided UUID and returns it if valid.
 * If the UUID is invalid, sends a 400 Bad Request response and returns null.
 *
 * @param uuid The UUID to validate.
 * @param res The response object to send errors to.
 * @returns A promise that resolves to the parsed UUID if valid, or null if invalid.
 */
export const validateUuid = async (uuid: unknown, res: Response): Promise<null | Uuid> => {
  const parsedUuid = await uuidObject.safeParseAsync(uuid);

  if (parsedUuid.success === false) {
    res.status(HttpStatusCode.BadRequest).send(zodErrorToResponse400(parsedUuid.error));
    return null;
  }
  return parsedUuid.data;
};
