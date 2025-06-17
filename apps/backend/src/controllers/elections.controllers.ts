import type { Response } from 'express';
import {
  insertableElectionObject,
  type Response500,
  type SelectableElection,
  zodErrorToResponse400,
  type Response400,
} from '@repo/votura-validators';
import { createElection as createPersistentElection } from '../services/elections.service.js';
import type { AuthenticatedRequest } from '../middlewares/auth.js';

export type CreateElectionResponse = Response<SelectableElection | Response400 | Response500>;

export const createElection = async (
  req: AuthenticatedRequest,
  res: CreateElectionResponse,
): Promise<void> => {
  if (req.user === undefined) {
    res.status(401).send({ message: 'User not authenticated.' });
    return;
  }
  const body: unknown = req.body;

  const { data, error, success } = await insertableElectionObject.safeParseAsync(body);

  if (success) {
    const selectableElection = await createPersistentElection(data, req.user.id);

    if (selectableElection === null) {
      res.sendStatus(500);
      return;
    }

    res.status(201).send(selectableElection);
  } else {
    res.status(400).send(zodErrorToResponse400(error));
  }
};
