import { getPepper, hashPassword } from '@repo/hash';
import {
  insertableUserObject,
  requestPasswordResetUserObject,
  response409Object,
  response429Object,
  response4XXObject,
  zodErrorToResponse400,
  type ApiTokenUser,
  type Response400,
  type Response401,
  type Response403,
  type Response409,
  type Response429,
  type SelectableUser,
} from '@repo/votura-validators';
import type { Request, Response } from 'express';
import type { AccessTokenPayload } from '../auth/types.js';
import { generatePasswordResetToken, hashPasswordResetToken } from '../auth/utils.js';
import { HttpStatusCode } from '../httpStatusCode.js';
import { sendPasswordResetEmail } from '../mail/mailer.js';
import { resetFailedLoginAttempts } from '../services/loginAttempt.service.js';
import {
  createNewUserTokens,
  createUser as createPersistentUser,
  deleteUser as deletePersistentUser,
  findDBUserBy,
  findUserBy,
  logoutUser,
  resetUserPassword,
  setPasswordResetToken,
} from '../services/users.service.js';
import { isBodyCheckValidationError } from './bodyChecks/bodyCheckValidationError.js';
import {
  validateLoginRequest,
  validateResetPasswordRequest,
  validateTokenRefreshRequest,
} from './bodyChecks/userChecks.js';

/** Time-to-live for a password reset token in milliseconds (1 hour). */
const PASSWORD_RESET_TOKEN_TTL_MS = 60 * 60 * 1000;

export type CreateUserResponse = Response<void | Response400 | Response409>;

export const createUser = async (req: Request, res: CreateUserResponse): Promise<void> => {
  const body: unknown = req.body;

  const { data, error, success } = await insertableUserObject.safeParseAsync(body);

  if (success) {
    // Check if a user with the provided email already exists
    const user = await findUserBy({
      email: data.email,
    });
    if (user !== null) {
      res.status(HttpStatusCode.conflict).json(
        response409Object.parse({
          message: 'User with the provided email address already exists.',
        }),
      );
      return;
    }

    await createPersistentUser(data);

    res.sendStatus(HttpStatusCode.noContent);
  } else {
    res.status(HttpStatusCode.badRequest).json(zodErrorToResponse400(error));
  }
};

export const deleteUser = async (
  _req: Request,
  res: Response<void, { user: SelectableUser }>,
): Promise<void> => {
  await deletePersistentUser(res.locals.user.id);
  res.sendStatus(HttpStatusCode.noContent);
};

export type LoginResponse = Response<
  ApiTokenUser | Response400 | Response401 | Response403 | Response429
>;

export const login = async (req: Request, res: LoginResponse): Promise<void> => {
  const ipAddress = req.ip ?? '0.0.0.0';
  const validationResult = await validateLoginRequest(req.body, ipAddress);
  if (isBodyCheckValidationError(validationResult)) {
    if (validationResult.status === HttpStatusCode.tooManyRequests) {
      res.status(HttpStatusCode.tooManyRequests).json(
        response429Object.parse({
          message: validationResult.message,
          retryIn: validationResult.retryIn ?? { hours: 0, minutes: 0, seconds: 0 },
        }),
      );
      return;
    }

    res
      .status(validationResult.status)
      .json(response4XXObject.parse({ message: validationResult.message }));
    return;
  }

  await resetFailedLoginAttempts(ipAddress, validationResult);
  const loginResult = await createNewUserTokens(validationResult);
  res.status(HttpStatusCode.ok).json(loginResult);
};

export type RefreshTokensResponse = Response<ApiTokenUser | Response400 | Response401>;

export const refreshTokens = async (req: Request, res: RefreshTokensResponse): Promise<void> => {
  const validationResult = await validateTokenRefreshRequest(req.body);
  if (isBodyCheckValidationError(validationResult)) {
    res
      .status(validationResult.status)
      .json(response4XXObject.parse({ message: validationResult.message }));
    return;
  }

  const refreshResults = await createNewUserTokens(validationResult);
  res.status(HttpStatusCode.ok).json(refreshResults);
};

export type LogoutResponse = Response<
  void | Response401,
  { user: SelectableUser; accessTokenPayload: AccessTokenPayload }
>;

export const logout = async (_req: Request, res: LogoutResponse): Promise<void> => {
  await logoutUser(res.locals.accessTokenPayload, res.locals.user.id);

  res.sendStatus(HttpStatusCode.noContent);
};

export type RequestPasswordResetResponse = Response<void | Response400>;

export const requestPasswordReset = async (
  req: Request,
  res: RequestPasswordResetResponse,
): Promise<void> => {
  const { data, error, success } = await requestPasswordResetUserObject.safeParseAsync(req.body);
  if (!success) {
    res.status(HttpStatusCode.badRequest).json(zodErrorToResponse400(error));
    return;
  }

  const user = await findDBUserBy({ email: data.email });

  // Only generate a token and send an email if the user exists. The response is
  // always 204 to avoid leaking whether an account exists for the given email.
  if (user !== null) {
    const rawToken = generatePasswordResetToken();
    const tokenHash = hashPasswordResetToken(rawToken);
    const expiresAt = new Date(Date.now() + PASSWORD_RESET_TOKEN_TTL_MS);

    await setPasswordResetToken(user.id, tokenHash, expiresAt);
    await sendPasswordResetEmail(user.email, rawToken);
  }

  res.sendStatus(HttpStatusCode.noContent);
};

export type ResetPasswordResponse = Response<void | Response400 | Response401>;

export const resetPassword = async (req: Request, res: ResetPasswordResponse): Promise<void> => {
  const validationResult = await validateResetPasswordRequest(req.body);
  if (isBodyCheckValidationError(validationResult)) {
    res
      .status(validationResult.status)
      .json(response4XXObject.parse({ message: validationResult.message }));
    return;
  }

  const newPasswordHash = await hashPassword(validationResult.password, getPepper());
  await resetUserPassword(validationResult.userId, newPasswordHash);

  res.sendStatus(HttpStatusCode.noContent);
};
