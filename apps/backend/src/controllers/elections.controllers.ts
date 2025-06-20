import {
  insertableElectionObject,
  zodErrorToResponse400,
  type Response400,
  type Response500,
  type SelectableElection,
  type SelectableUser,
  type Election,
  response404Object,
  type Response404,
} from '@repo/votura-validators';
import {
  createElection as createPersistentElection,
  getAllElections,
  getElection as getPersistentElection,
} from '../services/elections.service.js';
import type { Request, Response } from 'express';
import { HttpStatusCode } from '../httpStatusCode.js';

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
      res.sendStatus(HttpStatusCode.InternalServerError);
      return;
    }

    res.status(HttpStatusCode.Created).send(selectableElection);
  } else {
    res.status(HttpStatusCode.BadRequest).send(zodErrorToResponse400(error));
  }
};

export type GetAllElectionsResponse = Response<SelectableElection[], { user: SelectableUser }>;

export const getElections = async (_req: Request, res: GetAllElectionsResponse): Promise<void> => {
  const elections = await getAllElections(res.locals.user.id);

  res.status(HttpStatusCode.Ok).json(elections);
};

export type GetElectionRequest = Request<{ electionId: Election['id'] }>;
export type GetElectionResponse = Response<
  SelectableElection | Response404,
  { user: SelectableUser }
>;

export const getElection = async (
  req: GetElectionRequest,
  res: GetElectionResponse,
): Promise<void> => {
  const election = await getPersistentElection(req.params.electionId, res.locals.user.id);

  if (election === null) {
    res.status(HttpStatusCode.NotFound).json(response404Object.parse({}));
    return;
  }

  res.status(HttpStatusCode.Ok).json(election);
};
