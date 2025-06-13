import { type Request, type Response } from 'express';
import { findUserById } from '../services/users.service.js';
import { StatusCode } from '../utils/statusCode.js';

export interface GetUserByIdParams {
  id: string;
}

export const getUsers = async (req: Request, res: Response): Promise<void> => {
  res.sendStatus(StatusCode.NOT_IMPLEMENTED);
};

export const getUserById = async (
  req: Request<GetUserByIdParams>,
  res: Response,
): Promise<void> => {
  const id = req.params.id;

  if (id === '') {
    res.status(StatusCode.BAD_REQUEST).json({ message: 'Invalid user id.' });
    return;
  }

  const user = await findUserById(id);

  if (!user) {
    res.status(StatusCode.NOT_FOUND).json({ message: 'User not found' });
    return;
  }

  res.status(StatusCode.OK).json(user);
};
