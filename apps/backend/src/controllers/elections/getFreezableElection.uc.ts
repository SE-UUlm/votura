import type { Election, FreezableElection } from '@repo/votura-validators';
import type { Request, Response } from 'express';
import { HttpStatusCode } from '../../httpStatusCode.js';
import { isElectionValid } from '../../middlewares/pathParamChecks/electionChecks.js';
import { isElectionFrozen } from '../../services/elections.service.js';

export const getFreezableElection = async (
  req: Request<{ electionId: Election['id'] }>,
  res: Response<FreezableElection>,
): Promise<void> => {
  // If election is not frozen and valid it is freezable
  if (
    (await isElectionFrozen(req.params.electionId)) ||
    !(await isElectionValid(req.params.electionId))
  ) {
    res.status(HttpStatusCode.ok).json({ freezable: false, id: req.params.electionId });
    return;
  }

  res.status(HttpStatusCode.ok).json({ freezable: true, id: req.params.electionId });
};
