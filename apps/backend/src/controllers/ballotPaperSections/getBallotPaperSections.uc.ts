import type { BallotPaper, SelectableBallotPaperSection } from '@repo/votura-validators';
import type { Request, Response } from 'express';
import { HttpStatusCode } from '../../httpStatusCode.js';
import { getBallotPaperSections as getPersistentBallotPaperSections } from '../../services/ballotPaperSections.service.js';

export const getBallotPaperSections = async (
  req: Request<{ ballotPaperId: BallotPaper['id'] }>,
  res: Response<SelectableBallotPaperSection[]>,
): Promise<void> => {
  const ballotPaperSections = await getPersistentBallotPaperSections(req.params.ballotPaperId);
  res.status(HttpStatusCode.ok).json(ballotPaperSections);
};
