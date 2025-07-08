import {
  insertableUserObject,
  refreshRequestUserObject,
  response401Object,
  response403Object,
  response409Object,
  response500Object,
  zodErrorToResponse400,
  type ApiTokenUser,
  type Response400,
  type Response401,
  type Response403,
  type Response409,
  type Response500,
  type SelectableUser,
} from '@repo/votura-validators';
import type { Request, Response } from 'express';
import type { AccessTokenPayload } from '../auth/types.js';
import { HttpStatusCode } from '../httpStatusCode.js';
import {
  createUser as createPersistentUser,
  findUserBy,
  loginError,
  loginUser,
  logoutUser,
  refreshTokenError,
  refreshUserTokens,
} from '../services/users.service.js';

export type CreateUserResponse = Response<void | Response400 | Response409 | Response500>;

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

    const createdUser: boolean = await createPersistentUser(data);

    if (!createdUser) {
      res
        .status(HttpStatusCode.internalServerError)
        .json(
          response500Object.parse({ message: 'Failed to create user due to internal errors.' }),
        );
      return;
    }

    res.sendStatus(HttpStatusCode.noContent);
  } else {
    res.status(HttpStatusCode.badRequest).json(zodErrorToResponse400(error));
  }
};

export type LoginResponse = Response<
  ApiTokenUser | Response400 | Response401 | Response403 | Response500
>;

export const login = async (req: Request, res: LoginResponse): Promise<void> => {
  const body: unknown = req.body;

  const { data, error, success } = await insertableUserObject.safeParseAsync(body);

  if (success) {
    const loginResult = await loginUser(data);

    switch (loginResult) {
      case loginError.InvalidCredentials:
        res
          .status(HttpStatusCode.unauthorized)
          .json(response401Object.parse({ message: loginError.InvalidCredentials }));
        break;
      case loginError.UserNotVerified:
        res
          .status(HttpStatusCode.forbidden)
          .json(response403Object.parse({ message: loginError.UserNotVerified }));
        break;
      case loginError.Internal:
        res
          .status(HttpStatusCode.internalServerError)
          .json(response500Object.parse({ message: loginError.Internal }));
        break;
      default: {
        const tokens: ApiTokenUser = loginResult;
        res.status(HttpStatusCode.ok).json(tokens);
        break;
      }
    }
    return;
  }

  res.status(HttpStatusCode.badRequest).json(zodErrorToResponse400(error));
};

export type RefreshTokensResponse = Response<
  ApiTokenUser | Response400 | Response401 | Response500
>;

export const refreshTokens = async (req: Request, res: Response): Promise<void> => {
  const body: unknown = req.body;

  const { data, error, success } = await refreshRequestUserObject.safeParseAsync(body);

  if (success) {
    const refreshResults = await refreshUserTokens(data);

    switch (refreshResults) {
      case refreshTokenError.InvalidToken:
        res
          .status(HttpStatusCode.unauthorized)
          .json(response401Object.parse({ message: refreshTokenError.InvalidToken }));
        break;
      case refreshTokenError.UserNotFound:
        res
          .status(HttpStatusCode.unauthorized)
          .json(response401Object.parse({ message: refreshTokenError.UserNotFound }));
        break;
      case refreshTokenError.TokenExpired:
        res
          .status(HttpStatusCode.unauthorized)
          .json(response401Object.parse({ message: refreshTokenError.TokenExpired }));
        break;
      case refreshTokenError.Internal:
        res
          .status(HttpStatusCode.internalServerError)
          .json(response500Object.parse({ message: refreshTokenError.Internal }));
        break;
      default: {
        const newTokens: ApiTokenUser = refreshResults;
        res.status(HttpStatusCode.ok).json(newTokens);
        break;
      }
    }
    return;
  }

  res.status(HttpStatusCode.badRequest).json(zodErrorToResponse400(error));
};

export type LogoutResponse = Response<
  void | Response401 | Response500,
  { user: SelectableUser; accessTokenPayload: AccessTokenPayload }
>;

export const logout = async (_req: Request, res: LogoutResponse): Promise<void> => {
  const logoutResult = await logoutUser(res.locals.accessTokenPayload, res.locals.user.id);

  if (!logoutResult) {
    res
      .status(HttpStatusCode.unauthorized)
      .json(response500Object.parse({ message: 'Failed to log out due to internal server error' }));
    return;
  }

  res.sendStatus(HttpStatusCode.noContent);
};
