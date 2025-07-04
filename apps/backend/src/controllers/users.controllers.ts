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
} from '@repo/votura-validators';
import type { Request, Response } from 'express';
import { HttpStatusCode } from '../httpStatusCode.js';
import type { AuthenticatedRequest } from '../middlewares/auth.js';
import {
  createUser as createPersistentUser,
  findUserBy,
  loginError,
  loginUser,
  logoutUser,
  refreshTokenError,
  refreshUserTokens,
} from '../services/users.service.js';

export interface GetUserByIdParams {
  id: string;
}

export const getUsers = (_req: Request, res: Response): void => {
  res.sendStatus(501);
};

export const getUserById = async (
  req: Request<GetUserByIdParams>,
  res: Response,
): Promise<void> => {
  const id = req.params.id;

  if (id === '') {
    res.status(HttpStatusCode.BadRequest).json({ message: 'Invalid user id.' });
    return;
  }

  const user = await findUserBy({
    id: id,
  });

  if (!user) {
    res.status(HttpStatusCode.NotFound).json({ message: 'User not found' });
    return;
  }

  res.status(HttpStatusCode.Ok).json(user);
};

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
      res.status(HttpStatusCode.Conflict).json(
        response409Object.parse({
          message: 'User with the provided email address already exists.',
        }),
      );
      return;
    }

    const createdUser: boolean = await createPersistentUser(data);

    if (!createdUser) {
      res
        .status(HttpStatusCode.InternalServerError)
        .json(
          response500Object.parse({ message: 'Failed to create user due to internal errors.' }),
        );
      return;
    }

    res.sendStatus(HttpStatusCode.NoContent);
  } else {
    res.status(HttpStatusCode.BadRequest).json(zodErrorToResponse400(error));
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
          .status(HttpStatusCode.Unauthorized)
          .json(response401Object.parse({ message: loginError.InvalidCredentials }));
        break;
      case loginError.UserNotVerified:
        res
          .status(HttpStatusCode.Forbidden)
          .json(response403Object.parse({ message: loginError.UserNotVerified }));
        break;
      case loginError.Internal:
        res
          .status(HttpStatusCode.InternalServerError)
          .json(response500Object.parse({ message: loginError.Internal }));
        break;
      default:
        const tokens: ApiTokenUser = loginResult;
        res.status(HttpStatusCode.Ok).json(tokens);
        break;
    }
    return;
  } else {
    res.status(HttpStatusCode.BadRequest).json(zodErrorToResponse400(error));
  }
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
          .status(HttpStatusCode.Unauthorized)
          .json(response401Object.parse({ message: refreshTokenError.InvalidToken }));
        break;
      case refreshTokenError.UserNotFound:
        res
          .status(HttpStatusCode.Unauthorized)
          .json(response401Object.parse({ message: refreshTokenError.UserNotFound }));
        break;
      case refreshTokenError.TokenExpired:
        res
          .status(HttpStatusCode.Unauthorized)
          .json(response401Object.parse({ message: refreshTokenError.TokenExpired }));
        break;
      case refreshTokenError.Internal:
        res
          .status(HttpStatusCode.InternalServerError)
          .json(response500Object.parse({ message: refreshTokenError.Internal }));
        break;
      default:
        const newTokens: ApiTokenUser = refreshResults;
        res.status(HttpStatusCode.Ok).json(newTokens);
        break;
    }
    return;
  } else {
    res.status(HttpStatusCode.BadRequest).json(zodErrorToResponse400(error));
  }
};

export const logout = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  if (req.user === undefined) {
    res.status(401).send({ message: 'User not authenticated.' });
    return;
  }

  try {
    const authHeader = req.headers.authorization;
    const accessToken = authHeader && authHeader.split(' ')[1];

    if (accessToken === undefined) {
      res.status(401).json({ error: 'Authentication required' }); // should not happen
      return;
    }
    // Logout user
    await logoutUser(accessToken, req.user.id);

    res.sendStatus(204); // No Content
  } catch (error) {
    res.status(500).json({ error: 'Internal server error while logging out' });
  }
};
