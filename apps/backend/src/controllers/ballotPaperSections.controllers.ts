import {
  insertableBallotPaperSectionObject,
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
  createBallotPaperSection as createPersistentBallotPaperSection,
  getBallotPaperSection as getPersistentBallotPaperSection,
  getBallotPaperSections as getPersistentBallotPaperSections,
  updateBallotPaperSection as updatePersistentBallotPaperSection,
} from '../services/ballotPaperSections.service.js';

export const createBallotPaperSection = async (
  req: Request<{ ballotPaperId: BallotPaper['id'] }>,
  res: Response<SelectableBallotPaperSection | Response400 | Response404>,
): Promise<void> => {
  const body: unknown = req.body;
  const { data, error, success } = await insertableBallotPaperSectionObject.safeParseAsync(body);
  if (success === false) {
    res.status(HttpStatusCode.BadRequest).send(zodErrorToResponse400(error));
    return;
  }

  const selectableBallotPaperSection = await createPersistentBallotPaperSection(
    data,
    req.params.ballotPaperId,
  );
  if (selectableBallotPaperSection === null) {
    res.status(HttpStatusCode.NotFound).json(response404Object.parse({ message: undefined }));
    return;
  }
  res.status(HttpStatusCode.Created).json(selectableBallotPaperSection);
};

export const getBallotPaperSections = async (
  req: Request<{ ballotPaperId: BallotPaper['id'] }>,
  res: Response<SelectableBallotPaperSection[]>,
): Promise<void> => {
  const ballotPaperSections = await getPersistentBallotPaperSections(req.params.ballotPaperId);
  res.status(HttpStatusCode.Ok).json(ballotPaperSections);
};

export const updateBallotPaperSection = async (
  req: Request<{ ballotPaperSectionId: BallotPaperSection['id'] }>,
  res: Response<SelectableBallotPaperSection | Response400 | Response404>,
): Promise<void> => {
  const body: unknown = req.body;
  const { data, error, success } = await updateableBallotPaperSectionObject.safeParseAsync(body);
  if (success === false) {
    res.status(HttpStatusCode.BadRequest).send(zodErrorToResponse400(error));
    return;
  }

  const selectableBallotPaperSection = await updatePersistentBallotPaperSection(
    data,
    req.params.ballotPaperSectionId,
  );
  if (selectableBallotPaperSection === null) {
    res.status(HttpStatusCode.NotFound).json(response404Object.parse({ message: undefined }));
    return;
  }
  res.status(HttpStatusCode.Ok).json(selectableBallotPaperSection);
};

export const getBallotPaperSection = async (
  req: Request<{ ballotPaperSectionId: BallotPaperSection['id'] }>,
  res: Response<SelectableBallotPaperSection | Response404>,
): Promise<void> => {
  const ballotPaperSection = await getPersistentBallotPaperSection(req.params.ballotPaperSectionId);
  if (ballotPaperSection === null) {
    res.status(HttpStatusCode.NotFound).json(response404Object.parse({ message: undefined }));
    return;
  }
  res.status(HttpStatusCode.Ok).json(ballotPaperSection);
};
