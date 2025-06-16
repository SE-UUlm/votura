import type { Request, Response } from 'express';
import {
  insertableUserObject,
  zodErrorToResponse400,
  type Response400,
  type Response409,
  type Response500,
} from '@repo/votura-validators';
import { findUserBy } from '../services/users.service.js';
import { createUser as createPersistentUser } from '../services/users.service.js';

export interface GetUserByIdParams {
  id: string;
}

export const getUsers = (req: Request, res: Response): void => {
  res.sendStatus(501);
};

export const getUserById = async (
  req: Request<GetUserByIdParams>,
  res: Response,
): Promise<void> => {
  const id = req.params.id;

  if (id === '') {
    res.status(400).json({ message: 'Invalid user id.' });
    return;
  }

  const user = await findUserBy({
    id: id,
  });

  if (!user) {
    res.status(404).json({ message: 'User not found' });
    return;
  }

  res.status(200).json(user);
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
    if (user) {
      res.status(409).json({ message: 'User with the provided email address already exists.' });
      return;
    }

    const createdUser = await createPersistentUser(data);

    if (!createdUser) {
      res.sendStatus(500);
      return;
    }

    res.status(204);
  } else {
    res.status(400).json(zodErrorToResponse400(error));
  }
};
