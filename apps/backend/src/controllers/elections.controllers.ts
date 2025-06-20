import {
  insertableElectionObject,
  response500Object,
  zodErrorToResponse400,
  type Response400,
  type Response500,
  type SelectableElection,
  type SelectableUser,
} from '@repo/votura-validators';
import type { Request, Response } from 'express';
import { HttpStatusCode } from '../httpStatusCode.js';
import { createElection as createPersistentElection } from '../services/elections.service.js';

export type CreateElectionResponse = Response<
  SelectableElection | Response400 | Response500,
  { user: SelectableUser }
>;

export const createElection = async (req: Request, res: CreateElectionResponse): Promise<void> => {
  const body: unknown = req.body;

  const { data, error, success } = await insertableElectionObject.safeParseAsync(body);

  if (success) {
    const selectableElection = await createPersistentElection(data, res.locals.user.id);

    if (selectableElection === null) {
      res
        .status(HttpStatusCode.InternalServerError)
        .json(response500Object.parse({ message: undefined }));
      return;
    }

    res.status(HttpStatusCode.Created).send(selectableElection);
  } else {
    res.status(HttpStatusCode.BadRequest).send(zodErrorToResponse400(error));
  }
};
