import type { BallotPaperSection, SelectableBallotPaperSection } from '@repo/votura-validators';
import type { Request, Response } from 'express';
import { HttpStatusCode } from '../../httpStatusCode.js';
import { getBallotPaperSection as getPersistentBallotPaperSection } from '../../services/ballotPaperSections.service.js';

export const getBallotPaperSection = async (
  req: Request<{ ballotPaperSectionId: BallotPaperSection['id'] }>,
  res: Response<SelectableBallotPaperSection>,
): Promise<void> => {
  const ballotPaperSection = await getPersistentBallotPaperSection(req.params.ballotPaperSectionId);
  res.status(HttpStatusCode.ok).json(ballotPaperSection);
};
