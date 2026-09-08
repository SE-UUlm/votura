import type { Election, SelectableBallotPaper } from '@repo/votura-validators';
import type { Request, Response } from 'express';
import { HttpStatusCode } from '../../httpStatusCode.js';
import { getBallotPapers as getPersistentBallotPapers } from '../../services/ballotPapers.service.js';

export const getBallotPapers = async (
  req: Request<{ electionId: Election['id'] }>,
  res: Response<SelectableBallotPaper[]>,
): Promise<void> => {
  const ballotPapers = await getPersistentBallotPapers(req.params.electionId);
  res.status(HttpStatusCode.ok).json(ballotPapers);
};
