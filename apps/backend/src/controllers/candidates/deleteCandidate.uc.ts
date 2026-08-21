import { response404Object, type Candidate, type Response404 } from '@repo/votura-validators';
import type { Request, Response } from 'express';
import { HttpStatusCode } from '../../httpStatusCode.js';
import { deleteCandidate as deletePersistentCandidate } from '../../services/candidates.service.js';

export const deleteCandidate = async (
  req: Request<{ candidateId: Candidate['id'] }>,
  res: Response<Response404>,
): Promise<void> => {
  const result = await deletePersistentCandidate(req.params.candidateId);
  if (result.numDeletedRows < 1n) {
    res
      .status(HttpStatusCode.notFound)
      .json(response404Object.parse({ message: "Can't find candidate." }));
    return;
  }
  res.sendStatus(HttpStatusCode.noContent);
};
