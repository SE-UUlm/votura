import type { SelectableElection, SelectableUser } from '@repo/votura-validators';
import type { Request, Response } from 'express';
import { HttpStatusCode } from '../../httpStatusCode.js';
import {
  getAllElections,
  getElections as getPersistentElections,
} from '../../services/elections.service.js';

export const getElections = async (
  _req: Request,
  res: Response<SelectableElection[], { user: SelectableUser }>,
): Promise<void> => {
  const loggedInUser = res.locals.user;

  if (loggedInUser.role === 'admin') {
    res.status(HttpStatusCode.ok).json(await getAllElections());
    return;
  }

  res.status(HttpStatusCode.ok).json(await getPersistentElections(loggedInUser.id));
};
