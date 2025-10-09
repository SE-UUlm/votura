import {
  response4XXObject,
  type Response400,
  type Response403,
  type SelectableVotingElection,
} from '@repo/votura-validators';
import type { Request, Response } from 'express';
import { HttpStatusCode } from '../httpStatusCode.js';
import { getSelectableVotingElectionForVoter } from '../services/voters.service.js';
import { persistVote } from '../services/votes.service.js';
import { isBodyCheckValidationError } from './bodyChecks/bodyCheckValidationError.js';
import { validateEncryptedFilledBallotPaper } from './bodyChecks/voteChecks.js';

export const getElectionsForVoting = async (
  _req: Request,
  res: Response<SelectableVotingElection[], { voterId: string }>,
): Promise<void> => {
  const voterId = res.locals.voterId;

  const elections: SelectableVotingElection[] = await getSelectableVotingElectionForVoter(voterId);

  res.status(HttpStatusCode.ok).send(elections);
};

export const castVote = async (
  req: Request,
  res: Response<void | Response400 | Response403, { voterId: string }>,
): Promise<void> => {
  const voterId = res.locals.voterId;

  const validationResult = await validateEncryptedFilledBallotPaper(req.body, voterId);
  if (isBodyCheckValidationError(validationResult)) {
    res
      .status(validationResult.status)
      .json(response4XXObject.parse({ message: validationResult.message }));
    return;
  }

  // If we reach here, the filled ballot paper is valid and can be stored
  const encryptedFilledBallotPaper = validationResult;
  await persistVote(voterId, encryptedFilledBallotPaper);

  res.sendStatus(HttpStatusCode.noContent);
};
