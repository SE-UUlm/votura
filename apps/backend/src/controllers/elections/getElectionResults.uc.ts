import type { Election, SelectableElectionResult } from '@repo/votura-validators';
import type { Request, Response } from 'express';
import { HttpStatusCode } from '../../httpStatusCode.js';
import { getElectionResults as getPersistentElectionResults } from '../../services/elections.service.js';

export const getElectionResults = async (
  req: Request<{ electionId: Election['id'] }>,
  res: Response<SelectableElectionResult>,
): Promise<void> => {
  const electionResult = await getPersistentElectionResults(req.params.electionId);
  res.status(HttpStatusCode.ok).json(electionResult);
};
