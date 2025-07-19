import { logger } from '@repo/logger';
import {
  insertableElectionObject,
  response404Object,
  updateableElectionObject,
  zodErrorToResponse400,
  type Election,
  type Response400,
  type Response404,
  type SelectableElection,
  type SelectableUser,
} from '@repo/votura-validators';
import { getKeyPair } from '@votura/votura-crypto/index';
import type { Request, Response } from 'express';
import { HttpStatusCode } from '../httpStatusCode.js';
import {
  createElection as createPersistentElection,
  deleteElection as deletePersistentElection,
  freezeElection as freezePersistentElection,
  getElection as getPersistentElection,
  getElections as getPersistentElections,
  setElectionKeys,
  unfreezeElection as unfreezePersistentElection,
  updateElection as updatePersistentElection,
} from '../services/elections.service.js';

export type CreateElectionResponse = Response<
  SelectableElection | Response400 | Response404,
  { user: SelectableUser }
>;

export const createElection = async (req: Request, res: CreateElectionResponse): Promise<void> => {
  const body: unknown = req.body;

  const { data, error, success } = await insertableElectionObject.safeParseAsync(body);

  if (success) {
    const selectableElection = await createPersistentElection(data, res.locals.user.id);

    res.status(HttpStatusCode.created).send(selectableElection);
  } else {
    res.status(HttpStatusCode.badRequest).send(zodErrorToResponse400(error));
  }
};

export type GetAllElectionsResponse = Response<SelectableElection[], { user: SelectableUser }>;

export const getElections = async (_req: Request, res: GetAllElectionsResponse): Promise<void> => {
  const elections = await getPersistentElections(res.locals.user.id);

  res.status(HttpStatusCode.ok).json(elections);
};

export const updateElection = async (
  req: Request<{ electionId: Election['id'] }>,
  res: Response<SelectableElection | Response400 | Response404>,
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
  res.status(HttpStatusCode.ok).json(election);
};

export const freezeElection = async (
  req: Request<{ electionId: Election['id'] }>,
  res: Response<SelectableElection | Response400 | Response404>,
): Promise<void> => {
  let election = await freezePersistentElection(req.params.electionId);
  res.status(HttpStatusCode.ok).json(election);

  void (async (): Promise<void> => {
    logger.info(election, 'Starting the key generation process');
    const bitsPrimeP = parseInt(process.env.BITS_PRIME_P ?? '2048', 10);
    const keyPair = await getKeyPair(bitsPrimeP);
    election = await setElectionKeys(keyPair, election.id);
    logger.info(election, 'Key generation process completed');
  })();
};

export const unfreezeElection = async (
  req: Request<{ electionId: Election['id'] }>,
  res: Response<SelectableElection | Response400 | Response404>,
): Promise<void> => {
  const election = await unfreezePersistentElection(req.params.electionId);
  res.status(HttpStatusCode.ok).json(election);
};

export const deleteElection = async (
  req: Request<{ electionId: Election['id'] }>,
  res: Response<void | Response404>,
): Promise<void> => {
  const result = await deletePersistentElection(req.params.electionId);
  if (result.numDeletedRows < 1n) {
    res
      .status(HttpStatusCode.notFound)
      .json(
        response404Object.parse({ message: 'The provided election for deletion was not found.' }),
      );
    return;
  }
  res.sendStatus(HttpStatusCode.noContent);
};
