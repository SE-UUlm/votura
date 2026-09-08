import type { Election, SelectableElection } from '@repo/votura-validators';
import type { Request, Response } from 'express';
import { HttpStatusCode } from '../../httpStatusCode.js';
import { unfreezeElection as unfreezePersistentElection } from '../../services/elections.service.js';

export const unfreezeElection = async (
  req: Request<{ electionId: Election['id'] }>,
  res: Response<SelectableElection>,
): Promise<void> => {
  const election = await unfreezePersistentElection(req.params.electionId);
  res.status(HttpStatusCode.ok).json(election);
};
