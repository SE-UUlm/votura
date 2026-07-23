import type { Election, SelectableCandidate } from '@repo/votura-validators';
import type { Request, Response } from 'express';
import { HttpStatusCode } from '../../httpStatusCode.js';
import { getCandidates as getPersistentCandidates } from '../../services/candidates.service.js';

export const getCandidates = async (
  req: Request<{ electionId: Election['id'] }>,
  res: Response<SelectableCandidate[]>,
): Promise<void> => {
  const candidates = await getPersistentCandidates(req.params.electionId);
  res.status(HttpStatusCode.ok).json(candidates);
};
