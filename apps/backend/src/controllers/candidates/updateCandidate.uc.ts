import {
  updateableCandidateObject,
  zodErrorToResponse400,
  type Candidate,
  type Response400,
  type SelectableCandidate,
} from '@repo/votura-validators';
import type { Request, Response } from 'express';
import { HttpStatusCode } from '../../httpStatusCode.js';
import { updateCandidate as updatePersistentCandidate } from '../../services/candidates.service.js';

export const updateCandidate = async (
  req: Request<{ candidateId: Candidate['id'] }>,
  res: Response<SelectableCandidate | Response400>,
): Promise<void> => {
  const body: unknown = req.body;
  const { data, error, success } = await updateableCandidateObject.safeParseAsync(body);
  if (success === false) {
    res.status(HttpStatusCode.badRequest).send(zodErrorToResponse400(error));
    return;
  }

  const selectableCandidate = await updatePersistentCandidate(data, req.params.candidateId);
  res.status(HttpStatusCode.ok).json(selectableCandidate);
};
