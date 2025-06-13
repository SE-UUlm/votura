import { type Request, type Response } from 'express';
import {
  insertableElectionObject,
  type Response500,
  type SelectableElection,
  type SelectableUser,
  zodErrorToResponse400,
} from '@repo/votura-validators';
import { type Response400 } from '@repo/votura-validators';
import { createElection as createPersistentElection } from '../services/elections.service.js';

export type CreateElectionResponse = Response<
  SelectableElection | Response400 | Response500,
  { user: SelectableUser }
>;

export const createElection = async (req: Request, res: CreateElectionResponse) => {
  const body: unknown = req.body;

  const { data, error, success } = await insertableElectionObject.safeParseAsync(body);

  if (success) {
    const selectableElection = await createPersistentElection(data, res.locals.user.id);

    if (!selectableElection) {
      res.sendStatus(500);
      return;
    }

    res.status(201).send(selectableElection);
  } else {
    res.status(400).send(zodErrorToResponse400(error));
  }
};
