import type { SelectableElection, SelectableUser } from '@repo/votura-validators';
import type { Request, Response } from 'express';
import { HttpStatusCode } from '../../httpStatusCode.js';
import { getElections as getPersistentElections } from '../../services/elections.service.js';

export const getElections = async (
  _req: Request,
  res: Response<SelectableElection[], { user: SelectableUser }>,
): Promise<void> => {
  const elections = await getPersistentElections(res.locals.user.id);

  res.status(HttpStatusCode.ok).json(elections);
};
