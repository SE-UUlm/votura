import {
  insertableCandidateObject,
  zodErrorToResponse400,
  type Election,
  type Response400,
  type SelectableCandidate,
} from '@repo/votura-validators';
import type { Request, Response } from 'express';
import { HttpStatusCode } from '../../httpStatusCode.js';
import { createCandidate as createPersistentCandidate } from '../../services/candidates.service.js';

export const createCandidate = async (
  req: Request<{ electionId: Election['id'] }>,
  res: Response<SelectableCandidate | Response400>,
): Promise<void> => {
  const body: unknown = req.body;
  const { data, error, success } = await insertableCandidateObject.safeParseAsync(body);
  if (success === false) {
    res.status(HttpStatusCode.badRequest).send(zodErrorToResponse400(error));
    return;
  }

  const selectableCandidate = await createPersistentCandidate(data, req.params.electionId);
  res.status(HttpStatusCode.created).json(selectableCandidate);
};
