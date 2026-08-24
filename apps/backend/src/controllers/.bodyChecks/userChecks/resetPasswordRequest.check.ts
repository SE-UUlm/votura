import {
  passwordResetUserObject,
  zodErrorToResponse400,
  type PasswordResetUser,
  type User,
} from '@repo/votura-validators';
import { hashPasswordResetToken } from '../../../auth/utils.js';
import { HttpStatusCode } from '../../../httpStatusCode.js';
import { findDBUserByPasswordResetTokenHash } from '../../../services/users.service.js';
import type { BodyCheckValidationError } from '../bodyCheckValidationError.js';

export enum ResetPasswordRequestValidationErrorMessage {
  invalidToken = 'Invalid or expired password reset token.',
}

export interface ResetPasswordRequestValidationError extends BodyCheckValidationError {
  message: ResetPasswordRequestValidationErrorMessage | string;
}

export interface ValidatedResetPassword {
  userId: User['id'];
  password: PasswordResetUser['password'];
}

/**
 * Validate a reset password request body and resolve the reset token to a user.
 *
 * The same error is returned for an unknown and for an expired token so that the
 * response does not reveal which tokens exist.
 * @param reqBody The request body containing passwordResetToken and password.
 */
export const validateResetPasswordRequest = async (
  reqBody: unknown,
): Promise<ValidatedResetPassword | ResetPasswordRequestValidationError> => {
  const { data, error, success } = await passwordResetUserObject.safeParseAsync(reqBody);
  if (!success) {
    return {
      status: HttpStatusCode.badRequest,
      message: zodErrorToResponse400(error).message,
    };
  }

  // Only the hash of the reset token is persisted, so look the user up by hash.
  const tokenHash = hashPasswordResetToken(data.passwordResetToken);
  const user = await findDBUserByPasswordResetTokenHash(tokenHash);
  if (user === null) {
    return {
      status: HttpStatusCode.unauthorized,
      message: ResetPasswordRequestValidationErrorMessage.invalidToken,
    };
  }

  if (user.passwordResetTokenExpiresAt === null || user.passwordResetTokenExpiresAt < new Date()) {
    return {
      status: HttpStatusCode.unauthorized,
      message: ResetPasswordRequestValidationErrorMessage.invalidToken,
    };
  }

  return { userId: user.id, password: data.password };
};
