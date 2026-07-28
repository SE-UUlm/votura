import { response4XXObject, type Response400, type Response403 } from '@repo/votura-validators';
import type { Request, Response } from 'express';
import { HttpStatusCode } from '../../httpStatusCode.js';
import { persistVote } from '../../services/votes.service.js';
import { isBodyCheckValidationError } from '../.bodyChecks/bodyCheckValidationError.js';
import { validateEncryptedFilledBallotPaper } from '../.bodyChecks/voteChecks/encryptedFilledBallotPaper.check.js';

export const castVote = async (
  req: Request,
  res: Response<void | Response400 | Response403, { voterId: string }>,
): Promise<void> => {
  const voterId = res.locals.voterId;

  const validationResult = await validateEncryptedFilledBallotPaper(req.body, voterId);
  if (isBodyCheckValidationError(validationResult)) {
    res
      .status(validationResult.status)
      .json(response4XXObject.parse({ message: validationResult.message.slice(0, 256) }));
    return;
  }

  // If we reach here, the filled ballot paper is valid and can be stored
  const encryptedFilledBallotPaper = validationResult;
  await persistVote(voterId, encryptedFilledBallotPaper);

  res.sendStatus(HttpStatusCode.noContent);
};
