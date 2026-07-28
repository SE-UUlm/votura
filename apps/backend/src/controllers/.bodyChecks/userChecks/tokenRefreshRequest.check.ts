import {
  refreshRequestUserObject,
  zodErrorToResponse400,
  type User,
} from '@repo/votura-validators';
import { hashRefreshToken, verifyUserToken } from '../../../auth/utils.js';
import { HttpStatusCode } from '../../../httpStatusCode.js';
import { findDBUserBy } from '../../../services/users.service.js';
import type { BodyCheckValidationError } from '../bodyCheckValidationError.js';

export enum TokenRefreshRequestValidationErrorMessage {
  invalidToken = 'Invalid refresh token.',
  userNotFound = 'User not found.',
  tokenExpired = 'Refresh token has expired.',
}

export interface TokenRefreshRequestValidationError extends BodyCheckValidationError {
  message: TokenRefreshRequestValidationErrorMessage | string;
}

// Authenticate refresh token -- validateRefreshRequest -> error | userId
// TODO: TSDoc
export const validateTokenRefreshRequest = async (
  reqBody: unknown,
): Promise<User['id'] | TokenRefreshRequestValidationError> => {
  const { data, error, success } = await refreshRequestUserObject.safeParseAsync(reqBody);
  if (!success) {
    return {
      status: HttpStatusCode.badRequest,
      message: zodErrorToResponse400(error).message,
    };
  }

  // Verify refresh token
  const decodedToken = verifyUserToken(data.refreshToken);
  if (decodedToken === null || decodedToken.type !== 'refresh') {
    return {
      status: HttpStatusCode.unauthorized,
      message: TokenRefreshRequestValidationErrorMessage.invalidToken,
    };
  }

  // Get user and verify stored refresh token
  const user = await findDBUserBy({ id: decodedToken.sub });
  if (user === null) {
    return {
      status: HttpStatusCode.unauthorized,
      message: TokenRefreshRequestValidationErrorMessage.userNotFound,
    };
  }

  // Check if refresh token matches stored hash
  const refreshTokenHash = hashRefreshToken(data.refreshToken);
  if (user.refreshTokenHash !== refreshTokenHash) {
    return {
      status: HttpStatusCode.unauthorized,
      message: TokenRefreshRequestValidationErrorMessage.invalidToken,
    };
  }

  // Check if refresh token is expired (expiration date in payload is already checked by verifyUserToken)
  if (user.refreshTokenExpiresAt === null || user.refreshTokenExpiresAt < new Date()) {
    return {
      status: HttpStatusCode.unauthorized,
      message: TokenRefreshRequestValidationErrorMessage.tokenExpired,
    };
  }

  return user.id; // Return user ID if validation is successful
};
