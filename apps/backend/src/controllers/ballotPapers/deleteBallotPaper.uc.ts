import { response404Object, type BallotPaper, type Response404 } from '@repo/votura-validators';
import type { Request, Response } from 'express';
import { HttpStatusCode } from '../../httpStatusCode.js';
import { deleteBallotPaper as deletePersistentBallotPaper } from '../../services/ballotPapers.service.js';

export const deleteBallotPaper = async (
  req: Request<{ ballotPaperId: BallotPaper['id'] }>,
  res: Response<void | Response404>,
): Promise<void> => {
  const result = await deletePersistentBallotPaper(req.params.ballotPaperId);
  if (result.numDeletedRows < 1n) {
    res.status(HttpStatusCode.notFound).json(
      response404Object.parse({
        message: 'The provided ballot paper for deletion was not found.',
      }),
    );
    return;
  }
  res.sendStatus(HttpStatusCode.noContent);
};
