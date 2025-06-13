import { type Request, type Response } from 'express';
import { findUserById } from '../services/users.service.js';

export interface GetUserByIdParams {
  id: string;
}

export const getUsers = async (req: Request, res: Response): Promise<void> => {
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

  const user = await findUserById(id);

  if (!user) {
    res.status(404).json({ message: 'User not found' });
    return;
  }

  res.status(200).json(user);
};
