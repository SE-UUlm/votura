import {
  insertableUserObject,
  refreshRequestUserObject,
  response409Object,
  response4XXObject,
  zodErrorToResponse400,
  type ApiTokenUser,
  type Response400,
  type Response401,
  type Response403,
  type Response409,
  type SelectableUser,
} from '@repo/votura-validators';
import type { Request, Response } from 'express';
import type { AccessTokenPayload } from '../auth/types.js';
import { HttpStatusCode } from '../httpStatusCode.js';
import {
  createUser as createPersistentUser,
  deleteUser as deletePersistentUser,
  findUserBy,
  loginUser,
  logoutUser,
  refreshUserTokens,
} from '../services/users.service.js';

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

export type LoginResponse = Response<ApiTokenUser | Response400 | Response401 | Response403>;

export const login = async (req: Request, res: LoginResponse): Promise<void> => {
  const body: unknown = req.body;

  const { data, error, success } = await insertableUserObject.safeParseAsync(body);
  if (!success) {
    res.status(HttpStatusCode.badRequest).json(zodErrorToResponse400(error));
    return;
  }

  const loginResult = await loginUser(data);

  if ('message' in loginResult) {
    res.status(loginResult.status).json(response4XXObject.parse({ message: loginResult.message }));
    return;
  }

  res.status(HttpStatusCode.ok).json(loginResult);
};

export type RefreshTokensResponse = Response<ApiTokenUser | Response400 | Response401>;

export const refreshTokens = async (req: Request, res: Response): Promise<void> => {
  const body: unknown = req.body;
  const { data, error, success } = await refreshRequestUserObject.safeParseAsync(body);
  if (!success) {
    res.status(HttpStatusCode.badRequest).json(zodErrorToResponse400(error));
    return;
  }

  const refreshResults = await refreshUserTokens(data);

  if ('message' in refreshResults) {
    res
      .status(refreshResults.status)
      .json(response4XXObject.parse({ message: refreshResults.message }));
    return;
  }

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
