import type { Request, Response } from 'express';
import { findUserBy } from '../services/users.service.js';
import { HttpStatusCode } from '../httpStatusCode.js';

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
