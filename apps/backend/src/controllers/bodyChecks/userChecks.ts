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

/**
 * Check whether the given IP address or user ID is currently blocked from logging in, and if so, return the appropriate error object
 * @param ipAddress
 * @param userId
 */
const checkLoginBlockedError = async (
  ipAddress: string,
  userId: string | null,
): Promise<LoginRequestValidationError | null> => {
  const retryIn = await getRetryIn(ipAddress, userId);
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

/**
 * Save a failed login attempt to the database and return either a simple invalidCredentialsError, or a too many requests error, depending on whether the user was being blocked
 * @param ipAddress
 * @param userId
 */
const handleFailedLogin = async (
  ipAddress: string,
  userId: string | null,
): Promise<LoginRequestValidationError> => {
  await recordFailedLoginAttempt(ipAddress, userId);

  const loginBlockedError = await checkLoginBlockedError(ipAddress, userId);
  if (loginBlockedError) {
    return loginBlockedError;
  }

  return invalidCredentialsError;
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

  // Find user by email
  const user = await findDBUserBy({ email: data.email });

  let userId = null;
  if (user !== null) {
    userId = user.id;
  }

  // Check whether the IP address or the user is blocked before recording any failed login attempts
  const loginBlockedBeforeAttemptError = await checkLoginBlockedError(ipAddress, userId);
  if (loginBlockedBeforeAttemptError !== null) {
    return loginBlockedBeforeAttemptError;
  }

  // Handle invalid email
  if (user === null) {
    return handleFailedLogin(ipAddress, userId);
  }

  // Verify password
  const isValidPassword = await verifyPassword(user.passwordHash, data.password, getPepper());

  // Handle invalid password
  if (!isValidPassword) {
    return handleFailedLogin(ipAddress, userId);
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
