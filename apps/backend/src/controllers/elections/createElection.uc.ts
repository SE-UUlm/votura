import {
  insertableElectionObject,
  zodErrorToResponse400,
  type Response400,
  type SelectableElection,
  type SelectableUser,
} from '@repo/votura-validators';
import type { Request, Response } from 'express';
import { HttpStatusCode } from '../../httpStatusCode.js';
import { createElection as createPersistentElection } from '../../services/elections.service.js';

export const createElection = async (
  req: Request,
  res: Response<SelectableElection | Response400, { user: SelectableUser }>,
): Promise<void> => {
  const body: unknown = req.body;

  const { data, error, success } = await insertableElectionObject.safeParseAsync(body);

  if (success) {
    const selectableElection = await createPersistentElection(data, res.locals.user.id);

    res.status(HttpStatusCode.created).send(selectableElection);
  } else {
    res.status(HttpStatusCode.badRequest).send(zodErrorToResponse400(error));
  }
};
