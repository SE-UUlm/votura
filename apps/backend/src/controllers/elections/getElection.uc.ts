import type { Election, SelectableElection, SelectableUser } from '@repo/votura-validators';
import type { Request, Response } from 'express';
import { HttpStatusCode } from '../../httpStatusCode.js';
import { getElection as getPersistentElection } from '../../services/elections.service.js';

export const getElection = async (
  req: Request<{ electionId: Election['id'] }>,
  res: Response<SelectableElection, { user: SelectableUser }>,
): Promise<void> => {
  const election = await getPersistentElection(req.params.electionId, res.locals.user.id);
  res.status(HttpStatusCode.ok).json(election);
};
