import { getPepper, verifyPassword } from '@repo/hash';
import {
  setInitialPasswordDataObject,
  zodErrorToResponse400,
  type SetInitialPasswordData,
} from '@repo/votura-validators';
import { HttpStatusCode } from '../../../httpStatusCode.js';
import { findDBUserBy } from '../../../services/users.service.js';
import type { BodyCheckValidationError } from '../bodyCheckValidationError.js';

export interface SetInitialPasswordRequestValidationError extends BodyCheckValidationError {
  message: string;
}

/**
 * Validate set initial password request body
 * @param reqBody The request body containing userId, currentPassword, newPassword, and newPasswordVerification.
 */
export const validateSetInitialPasswordRequest = async (
  reqBody: unknown,
): Promise<SetInitialPasswordData | SetInitialPasswordRequestValidationError> => {
  const { data, error, success } = await setInitialPasswordDataObject.safeParseAsync(reqBody);
  if (!success) {
    return {
      status: HttpStatusCode.badRequest,
      message: zodErrorToResponse400(error).message,
    };
  }

  // Check whether user exists and is not verified (don't expose real reason on fail)
  const dbUser = await findDBUserBy({ id: data.userId });
  if (dbUser === null || dbUser === undefined || dbUser.verified) {
    return {
      status: HttpStatusCode.notFound,
      message: 'User not found.',
    };
  }

  // Check whether the one-time-password matches (don't expose real reason on fail)
  const isValidPassword = await verifyPassword(
    dbUser.passwordHash,
    data.currentPassword,
    getPepper(),
  );
  if (!isValidPassword) {
    return {
      status: HttpStatusCode.notFound,
      message: 'User not found.',
    };
  }

  return data;
};
