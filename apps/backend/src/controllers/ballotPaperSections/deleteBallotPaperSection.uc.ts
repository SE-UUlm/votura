import {
  response404Object,
  type BallotPaperSection,
  type Response404,
} from '@repo/votura-validators';
import type { Request, Response } from 'express';
import { HttpStatusCode } from '../../httpStatusCode.js';
import { deleteBallotPaperSection as deletePersistentBallotPaperSection } from '../../services/ballotPaperSections.service.js';

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
