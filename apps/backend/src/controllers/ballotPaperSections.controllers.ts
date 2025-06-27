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
import { createBallotPaperSection as createPersistentBallotPaperSection } from '../services/ballotPaperSections.service.js';

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
