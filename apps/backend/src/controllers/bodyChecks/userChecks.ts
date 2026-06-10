import { getPepper, verifyPassword } from '@repo/hash';
import {
  insertableUserObject,
  refreshRequestUserObject,
  zodErrorToResponse400,
  type Response429,
  type User,
} from '@repo/votura-validators';
import { hashRefreshToken, verifyUserToken } from '../../auth/utils.js';
import { HttpStatusCode } from '../../httpStatusCode.js';
import { getRetryIn, recordFailedLoginAttempt } from '../../services/loginAttempt.service.js';
import { findDBUserBy } from '../../services/users.service.js';
import type { BodyCheckValidationError } from './bodyCheckValidationError.js';

export enum LoginRequestValidationErrorMessage {
  invalidCredentials = 'Invalid credentials.',
  userNotVerified = 'User is not verified.',
}

export interface LoginRequestValidationError extends BodyCheckValidationError {
  message: LoginRequestValidationErrorMessage | string;
  retryIn?: Response429['retryIn'];
}

const checkLoginBlockedError = async (
  ipAddress: string,
): Promise<LoginRequestValidationError | null> => {
  const retryIn = await getRetryIn(ipAddress);
  if (retryIn === null) {
    return null;
  }

  return {
    status: HttpStatusCode.tooManyRequests,
    message: 'Too many failed login attempts. Please try again later.',
    retryIn: retryIn,
  };
};

const invalidCredentialsError = {
  status: HttpStatusCode.unauthorized,
  message: LoginRequestValidationErrorMessage.invalidCredentials,
};

export const validateLoginRequest = async (
  reqBody: unknown,
  ipAddress: string,
): Promise<User['id'] | LoginRequestValidationError> => {
  const { data, error, success } = await insertableUserObject.safeParseAsync(reqBody);
  if (!success) {
    return {
      status: HttpStatusCode.badRequest,
      message: zodErrorToResponse400(error).message,
    };
  }

  // Check whether IP address is blocked
  const loginBlockedBeforeAttemptError = await checkLoginBlockedError(ipAddress);
  if (loginBlockedBeforeAttemptError !== null) {
    return loginBlockedBeforeAttemptError;
  }

  // Find user by email
  const user = await findDBUserBy({ email: data.email });

  if (user === null) {
    return invalidCredentialsError; // User not found
  }

  // Verify password
  const isValidPassword: boolean = await verifyPassword(
    user.passwordHash,
    data.password,
    getPepper(),
  );
  if (!isValidPassword) {
    // Record that the login had failed
    await recordFailedLoginAttempt(ipAddress);

    // If the user got blocked, send the response with retry information
    const loginBlockedAfterAttemptError = await checkLoginBlockedError(ipAddress);
    if (loginBlockedAfterAttemptError !== null) {
      return loginBlockedAfterAttemptError;
    }

    // Otherwise, send an invalid password message
    return invalidCredentialsError; // Invalid password
  }

  // TODO: Uncomment when user verification is implemented (see issue #125)
  // Check if user is verified
  //if (!user.verified) {
  //  return loginError.UserNotVerified; // User not verified
  //}

  return user.id; // Return user ID if validation is successful
};

// ----------- Token Refresh Request Validation -----------
export enum TokenRefreshRequestValidationErrorMessage {
  invalidToken = 'Invalid refresh token.',
  userNotFound = 'User not found.',
  tokenExpired = 'Refresh token has expired.',
}

export interface TokenRefreshRequestValidationError extends BodyCheckValidationError {
  message: TokenRefreshRequestValidationErrorMessage | string;
}

// Authenticate refresh token -- validateRefreshRequest -> error | userId
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
