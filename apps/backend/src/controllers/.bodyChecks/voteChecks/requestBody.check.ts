import {
  encryptedFilledBallotPaperObject,
  zodErrorToResponse400,
  type EncryptedFilledBallotPaper,
} from '@repo/votura-validators';
import { HttpStatusCode } from '../../../httpStatusCode.js';
import type { VoteValidationError } from './encryptedFilledBallotPaper.check.js';

/**
 * Validate the request body against the filled ballot paper schema.
 * @param body The request body to validate.
 * @returns The validated filled ballot paper or a validation error.
 */
export const validateRequestBody = async (
  body: unknown,
): Promise<EncryptedFilledBallotPaper | VoteValidationError> => {
  const { data, error, success } = await encryptedFilledBallotPaperObject.safeParseAsync(body);

  if (!success) {
    return {
      status: HttpStatusCode.badRequest,
      message: zodErrorToResponse400(error).message,
    };
  }

  return data;
};
