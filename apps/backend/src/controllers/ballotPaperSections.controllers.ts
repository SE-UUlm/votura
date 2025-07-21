import {
  insertableBallotPaperSectionCandidateObject,
  insertableBallotPaperSectionObject,
  removableBallotPaperSectionCandidateObject,
  response404Object,
  updateableBallotPaperSectionObject,
  zodErrorToResponse400,
  type BallotPaper,
  type BallotPaperSection,
  type Response400,
  type Response404,
  type SelectableBallotPaperSection,
} from '@repo/votura-validators';
import type { Request, Response } from 'express';
import { HttpStatusCode } from '../httpStatusCode.js';
import {
  addCandidateToBallotPaperSection as addPersistentCandidateToBallotPaperSection,
  createBallotPaperSection as createPersistentBallotPaperSection,
  deleteBallotPaperSection as deletePersistentBallotPaperSection,
  getBallotPaperSection as getPersistentBallotPaperSection,
  getBallotPaperSections as getPersistentBallotPaperSections,
  removeCandidateFromBallotPaperSection as removePersistentCandidateFromBallotPaperSection,
  updateBallotPaperSection as updatePersistentBallotPaperSection,
} from '../services/ballotPaperSections.service.js';

export const createBallotPaperSection = async (
  req: Request<{ ballotPaperId: BallotPaper['id'] }>,
  res: Response<SelectableBallotPaperSection | Response400>,
): Promise<void> => {
  const body: unknown = req.body;
  const { data, error, success } = await insertableBallotPaperSectionObject.safeParseAsync(body);
  if (success === false) {
    res.status(HttpStatusCode.badRequest).send(zodErrorToResponse400(error));
    return;
  }

  const selectableBallotPaperSection = await createPersistentBallotPaperSection(
    data,
    req.params.ballotPaperId,
  );
  res.status(HttpStatusCode.created).json(selectableBallotPaperSection);
};

export const getBallotPaperSections = async (
  req: Request<{ ballotPaperId: BallotPaper['id'] }>,
  res: Response<SelectableBallotPaperSection[]>,
): Promise<void> => {
  const ballotPaperSections = await getPersistentBallotPaperSections(req.params.ballotPaperId);
  res.status(HttpStatusCode.ok).json(ballotPaperSections);
};

export const updateBallotPaperSection = async (
  req: Request<{ ballotPaperSectionId: BallotPaperSection['id'] }>,
  res: Response<SelectableBallotPaperSection | Response400>,
): Promise<void> => {
  const body: unknown = req.body;
  const { data, error, success } = await updateableBallotPaperSectionObject.safeParseAsync(body);
  if (success === false) {
    res.status(HttpStatusCode.badRequest).send(zodErrorToResponse400(error));
    return;
  }

  const selectableBallotPaperSection = await updatePersistentBallotPaperSection(
    data,
    req.params.ballotPaperSectionId,
  );
  res.status(HttpStatusCode.ok).json(selectableBallotPaperSection);
};

export const getBallotPaperSection = async (
  req: Request<{ ballotPaperSectionId: BallotPaperSection['id'] }>,
  res: Response<SelectableBallotPaperSection>,
): Promise<void> => {
  const ballotPaperSection = await getPersistentBallotPaperSection(req.params.ballotPaperSectionId);
  res.status(HttpStatusCode.ok).json(ballotPaperSection);
};

export const deleteBallotPaperSection = async (
  req: Request<{ ballotPaperSectionId: BallotPaperSection['id'] }>,
  res: Response<Response404>,
): Promise<void> => {
  const result = await deletePersistentBallotPaperSection(req.params.ballotPaperSectionId);
  if (result.numDeletedRows < 1n) {
    res
      .status(HttpStatusCode.notFound)
      .json(response404Object.parse({ message: "Can't find ballot paper section." }));
    return;
  }
  res.sendStatus(HttpStatusCode.noContent);
};

export const addCandidateToBallotPaperSection = async (
  req: Request<{
    ballotPaperSectionId: BallotPaperSection['id'];
  }>,
  res: Response<SelectableBallotPaperSection | Response400>,
): Promise<void> => {
  const { data, error, success } = await insertableBallotPaperSectionCandidateObject.safeParseAsync(
    req.body,
  );
  if (success === false) {
    res.status(HttpStatusCode.badRequest).send(zodErrorToResponse400(error));
    return;
  }

  const result = await addPersistentCandidateToBallotPaperSection(
    req.params.ballotPaperSectionId,
    data.candidateId,
  );
  res.status(HttpStatusCode.ok).json(result);
};

export const removeCandidateFromBallotPaperSection = async (
  req: Request<{
    ballotPaperSectionId: BallotPaperSection['id'];
  }>,
  res: Response<SelectableBallotPaperSection | Response400 | Response404>,
): Promise<void> => {
  const { data, error, success } = await removableBallotPaperSectionCandidateObject.safeParseAsync(
    req.body,
  );
  if (success === false) {
    res.status(HttpStatusCode.badRequest).send(zodErrorToResponse400(error));
    return;
  }

  const result = await removePersistentCandidateFromBallotPaperSection(
    req.params.ballotPaperSectionId,
    data.candidateId,
  );
  if (result === null) {
    res.status(HttpStatusCode.notFound).json(
      response404Object.parse({
        message: 'Candidate not linked to ballot paper section',
      }),
    );
    return;
  }
  res.status(HttpStatusCode.ok).json(result);
};
