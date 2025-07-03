import {
  insertableCandidateObject,
  response404Object,
  zodErrorToResponse400,
  type Election,
  type Response400,
  type Response404,
  type SelectableCandidate,
} from '@repo/votura-validators';
import type { Request, Response } from 'express';
import { HttpStatusCode } from '../httpStatusCode.js';
import { createCandidate as createPersistentCandidate } from '../services/candidates.service.js';

export const createCandidate = async (
  req: Request<{ electionId: Election['id'] }>,
  res: Response<SelectableCandidate | Response400 | Response404>,
): Promise<void> => {
  const body: unknown = req.body;
  const { data, error, success } = await insertableCandidateObject.safeParseAsync(body);
  if (success === false) {
    res.status(HttpStatusCode.BadRequest).send(zodErrorToResponse400(error));
    return;
  }

  const selectableCandidate = await createPersistentCandidate(data, req.params.electionId);
  if (selectableCandidate === null) {
    res.status(HttpStatusCode.NotFound).json(response404Object.parse({ message: 'undefined' }));
    return;
  }
  res.status(HttpStatusCode.Created).json(selectableCandidate);
};
