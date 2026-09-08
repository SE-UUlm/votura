import type { User as DBUser } from '@repo/db/types';
import { getPepper, verifyPassword } from '@repo/hash';
import {
  changePasswordUserObject,
  zodErrorToResponse400,
  type ChangePasswordUser,
} from '@repo/votura-validators';
import type { Selectable } from 'kysely';
import { HttpStatusCode } from '../../../httpStatusCode.js';
import type { BodyCheckValidationError } from '../bodyCheckValidationError.js';

export enum ChangePasswordRequestValidationErrorMessage {
  invalidCurrentPassword = 'Incorrect current password.',
}

export interface ChangePasswordRequestValidationError extends BodyCheckValidationError {
  message: ChangePasswordRequestValidationErrorMessage | string;
}

/**
 * Validate change password request body and verify the user's current password.
 * @param reqBody The request body containing currentPassword, newPassword, and newPasswordVerification.
 * @param dbUser The database user object of the authenticated user.
 */
export const validateChangePasswordRequest = async (
  reqBody: unknown,
  dbUser: Selectable<DBUser>,
): Promise<ChangePasswordUser | ChangePasswordRequestValidationError> => {
  const { data, error, success } = await changePasswordUserObject.safeParseAsync(reqBody);
  if (!success) {
    return {
      status: HttpStatusCode.badRequest,
      message: zodErrorToResponse400(error).message,
    };
  }

  const isValidPassword = await verifyPassword(
    dbUser.passwordHash,
    data.currentPassword,
    getPepper(),
  );
  if (!isValidPassword) {
    return {
      status: HttpStatusCode.badRequest,
      message: ChangePasswordRequestValidationErrorMessage.invalidCurrentPassword,
    };
  }

  return data;
};
