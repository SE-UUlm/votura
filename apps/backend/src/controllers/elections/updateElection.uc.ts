import {
  response403Object,
  updateableElectionObject,
  zodErrorToResponse400,
  type Election,
  type Response400,
  type Response403,
  type SelectableElection,
  type SelectableUser,
} from '@repo/votura-validators';
import type { Request, Response } from 'express';
import { HttpStatusCode } from '../../httpStatusCode.js';
import { updateElection as updatePersistentElection } from '../../services/elections.service.js';

export const updateElection = async (
  req: Request<{ electionId: Election['id'] }>,
  res: Response<SelectableElection | Response400 | Response403, { user: SelectableUser }>,
): Promise<void> => {
  const body: unknown = req.body;
  const { data, error, success } = await updateableElectionObject.safeParseAsync(body);
  if (success === false) {
    res.status(HttpStatusCode.badRequest).send(zodErrorToResponse400(error));
    return;
  }

  if (data.electionCreatorId !== undefined && res.locals.user.role !== 'admin') {
    res.status(HttpStatusCode.forbidden).json(
      response403Object.parse({
        message: 'Only administrators are allowed to change the owner of an election.',
      }),
    );
    return;
  }

  const selectableElection = await updatePersistentElection(data, req.params.electionId);
  res.status(HttpStatusCode.ok).json(selectableElection);
};
