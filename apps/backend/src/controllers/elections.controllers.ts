import {
  insertableElectionObject,
  response500Object,
  updateableElectionObject,
  zodErrorToResponse400,
  type Election,
  type Response400,
  type Response404,
  type Response500,
  type SelectableElection,
  type SelectableUser,
} from '@repo/votura-validators';
import type { Request, Response } from 'express';
import { HttpStatusCode } from '../httpStatusCode.js';
import {
  createElection as createPersistentElection,
  getElection as getPersistentElection,
  getElections as getPersistentElections,
  updateElection as updatePersistentElection,
} from '../services/elections.service.js';

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

export type GetAllElectionsResponse = Response<SelectableElection[], { user: SelectableUser }>;

export const getElections = async (_req: Request, res: GetAllElectionsResponse): Promise<void> => {
  const elections = await getPersistentElections(res.locals.user.id);

  res.status(HttpStatusCode.Ok).json(elections);
};

export const updateElection = async (
  req: Request<{ electionId: Election['id'] }>,
  res: Response<SelectableElection | Response400 | Response500>,
): Promise<void> => {
  const body: unknown = req.body;
  const { data, error, success } = await updateableElectionObject.safeParseAsync(body);
  if (success === false) {
    res.status(HttpStatusCode.BadRequest).send(zodErrorToResponse400(error));
    return;
  }

  const selectableElection = await updatePersistentElection(data, req.params.electionId);
  if (selectableElection === null) {
    res
      .status(HttpStatusCode.InternalServerError)
      .json(response500Object.parse({ message: undefined }));
    return;
  }
  res.status(HttpStatusCode.Ok).json(selectableElection);
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
    res
      .status(HttpStatusCode.InternalServerError)
      .json(response500Object.parse({ message: undefined }));
    return;
  }

  res.status(HttpStatusCode.Ok).json(election);
};
