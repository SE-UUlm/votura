import {
  insertableUserObject,
  response409Object,
  response500Object,
  zodErrorToResponse400,
  type Response400,
  type Response409,
  type Response500,
} from '@repo/votura-validators';
import type { Request, Response } from 'express';
import { HttpStatusCode } from '../httpStatusCode.js';
import { createUser as createPersistentUser, findUserBy } from '../services/users.service.js';

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
