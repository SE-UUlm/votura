import type { SelectableVotingElection } from '@repo/votura-validators';
import type { Request, Response } from 'express';
import { getSelectableVotingElectionForVoter } from '../services/voters.service.js';

export const getElectionsForVoting = async (
  _req: Request,
  res: Response<SelectableVotingElection[], { voterId: string }>,
): Promise<void> => {
  const voterId = res.locals.voterId;

  const elections: SelectableVotingElection[] = await getSelectableVotingElectionForVoter(voterId);

  res.status(200).json(elections);
};
