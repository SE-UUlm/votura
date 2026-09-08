import type { Candidate, SelectableCandidate } from '@repo/votura-validators';
import type { Request, Response } from 'express';
import { HttpStatusCode } from '../../httpStatusCode.js';
import { getCandidate as getPersistentCandidate } from '../../services/candidates.service.js';

export const getCandidate = async (
  req: Request<{ candidateId: Candidate['id'] }>,
  res: Response<SelectableCandidate>,
): Promise<void> => {
  const candidate = await getPersistentCandidate(req.params.candidateId);
  res.status(HttpStatusCode.ok).json(candidate);
};
