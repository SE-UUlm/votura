import { type Request, type Response } from 'express';
import {
  InsertableElectionObject,
  type SelectableElection,
  zodErrorToResponse400,
} from '@repo/votura-validators';
import { type Response400 } from '@repo/votura-validators';
import { createElection as createPersistentElection } from '../services/elections.service.js';
import { type User } from './../../generated/prisma/index.js';

export type CreateElectionResponse = Response<SelectableElection | Response400, { user: User }>;

export const createElection = async (req: Request, res: CreateElectionResponse) => {
  const body: unknown = req.body;

  const { data, error, success } = await InsertableElectionObject.safeParseAsync(body);

  if (success) {
    const selectableElection = await createPersistentElection(data, res.locals.user.id);

    res.status(201).send(selectableElection);
  } else {
    res.status(400).send(zodErrorToResponse400(error));
  }
};
