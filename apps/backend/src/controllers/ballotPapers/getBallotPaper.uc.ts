import type { BallotPaper, SelectableBallotPaper } from '@repo/votura-validators';
import type { Request, Response } from 'express';
import { HttpStatusCode } from '../../httpStatusCode.js';
import { getBallotPaper as getPersistentBallotPaper } from '../../services/ballotPapers.service.js';

export const getBallotPaper = async (
  req: Request<{ ballotPaperId: BallotPaper['id'] }>,
  res: Response<SelectableBallotPaper>,
): Promise<void> => {
  const ballotPaper = await getPersistentBallotPaper(req.params.ballotPaperId);
  res.status(HttpStatusCode.ok).json(ballotPaper);
};
