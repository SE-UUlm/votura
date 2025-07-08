import {
  insertableBallotPaperSectionObject,
  response404Object,
  zodErrorToResponse400,
  type BallotPaper,
  type Response400,
  type Response404,
  type SelectableBallotPaperSection,
} from '@repo/votura-validators';
import type { Request, Response } from 'express';
import { HttpStatusCode } from '../httpStatusCode.js';
import {
  createBallotPaperSection as createPersistentBallotPaperSection,
  getBallotPaperSections as getPersistentBallotPaperSections,
} from '../services/ballotPaperSections.service.js';

export const createBallotPaperSection = async (
  req: Request<{ ballotPaperId: BallotPaper['id'] }>,
  res: Response<SelectableBallotPaperSection | Response400 | Response404>,
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
  if (selectableBallotPaperSection === null) {
    res.status(HttpStatusCode.notFound).json(response404Object.parse({ message: undefined }));
    return;
  }
  res.status(HttpStatusCode.created).json(selectableBallotPaperSection);
};

export const getBallotPaperSections = async (
  req: Request<{ ballotPaperId: BallotPaper['id'] }>,
  res: Response<SelectableBallotPaperSection[]>,
): Promise<void> => {
  const ballotPaperSections = await getPersistentBallotPaperSections(req.params.ballotPaperId);
  res.status(HttpStatusCode.ok).json(ballotPaperSections);
};
