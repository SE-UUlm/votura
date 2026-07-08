import {
  updateableElectionObject,
  zodErrorToResponse400,
  type Election,
  type Response400,
  type SelectableElection,
} from '@repo/votura-validators';
import type { Request, Response } from 'express';
import { HttpStatusCode } from '../../httpStatusCode.js';
import { updateElection as updatePersistentElection } from '../../services/elections.service.js';

export const updateElection = async (
  req: Request<{ electionId: Election['id'] }>,
  res: Response<SelectableElection | Response400>,
): Promise<void> => {
  const body: unknown = req.body;
  const { data, error, success } = await updateableElectionObject.safeParseAsync(body);
  if (success === false) {
    res.status(HttpStatusCode.badRequest).send(zodErrorToResponse400(error));
    return;
  }

  const selectableElection = await updatePersistentElection(data, req.params.electionId);
  res.status(HttpStatusCode.ok).json(selectableElection);
};
