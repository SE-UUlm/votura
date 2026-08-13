import type { SelectableUser } from '@repo/votura-validators';
import type { Request, Response } from 'express';
import { getAllUsers } from '../../services/users.service.js';

export const getUsers = async (_req: Request, res: Response<SelectableUser[]>): Promise<void> => {
  const users = await getAllUsers();
  res.status(200).json(users);
};
