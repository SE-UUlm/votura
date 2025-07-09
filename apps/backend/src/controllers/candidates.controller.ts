import {
  insertableCandidateObject,
  response404Object,
  response500Object,
  updateableCandidateObject,
  zodErrorToResponse400,
  type Candidate,
  type Election,
  type Response400,
  type Response404,
  type SelectableCandidate,
} from '@repo/votura-validators';
import type { Request, Response } from 'express';
import { HttpStatusCode } from '../httpStatusCode.js';
import {
  createCandidate as createPersistentCandidate,
  deleteCandidate as deletePersistentCandidate,
  getCandidate as getPersistentCandidate,
  getCandidates as getPersistentCandidates,
  updateCandidate as updatePersistentCandidate,
} from '../services/candidates.service.js';

export const createCandidate = async (
  req: Request<{ electionId: Election['id'] }>,
  res: Response<SelectableCandidate | Response400 | Response404>,
): Promise<void> => {
  const body: unknown = req.body;
  const { data, error, success } = await insertableCandidateObject.safeParseAsync(body);
  if (success === false) {
    res.status(HttpStatusCode.badRequest).send(zodErrorToResponse400(error));
    return;
  }

  const selectableCandidate = await createPersistentCandidate(data, req.params.electionId);
  if (selectableCandidate === null) {
    res
      .status(HttpStatusCode.internalServerError)
      .json(response500Object.parse({ message: undefined }));
    return;
  }
  res.status(HttpStatusCode.created).json(selectableCandidate);
};

export const getCandidates = async (
  req: Request<{ electionId: Election['id'] }>,
  res: Response<SelectableCandidate[]>,
): Promise<void> => {
  const candidates = await getPersistentCandidates(req.params.electionId);
  res.status(HttpStatusCode.ok).json(candidates);
};

export const getCandidate = async (
  req: Request<{ candidateId: Candidate['id'] }>,
  res: Response<SelectableCandidate | Response404>,
): Promise<void> => {
  const candidate = await getPersistentCandidate(req.params.candidateId);
  if (candidate === null) {
    res
      .status(HttpStatusCode.notFound)
      .json(response404Object.parse({ message: "Can't find candidate." }));
    return;
  }
  res.status(HttpStatusCode.ok).json(candidate);
};

export const updateCandidate = async (
  req: Request<{ candidateId: Candidate['id'] }>,
  res: Response<SelectableCandidate | Response400 | Response404>,
): Promise<void> => {
  const body: unknown = req.body;
  const { data, error, success } = await updateableCandidateObject.safeParseAsync(body);
  if (success === false) {
    res.status(HttpStatusCode.badRequest).send(zodErrorToResponse400(error));
    return;
  }

  const selectableCandidate = await updatePersistentCandidate(data, req.params.candidateId);
  if (selectableCandidate === null) {
    res
      .status(HttpStatusCode.notFound)
      .json(response404Object.parse({ message: "Can't find candidate." }));
    return;
  }
  res.status(HttpStatusCode.ok).json(selectableCandidate);
};

export const deleteCandidate = async (
  req: Request<{ candidateId: Candidate['id'] }>,
  res: Response<Response404>,
): Promise<void> => {
  const result = await deletePersistentCandidate(req.params.candidateId);
  if (result.numDeletedRows < 1n) {
    res
      .status(HttpStatusCode.notFound)
      .json(response404Object.parse({ message: "Can't find candidate." }));
    return;
  }
  res.sendStatus(HttpStatusCode.noContent);
};
