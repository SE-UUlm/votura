import type { SelectableUser, SelectableVoterGroup } from '@repo/votura-validators';
import type { Request, Response } from 'express';
import { HttpStatusCode } from '../../httpStatusCode.js';
import { getVoterGroup } from '../../services/voterGroups.service.js';

export const getSpecificVoterGroup = async (
  req: Request<{ voterGroupId: SelectableVoterGroup['id'] }>,
  res: Response<SelectableVoterGroup, { user: SelectableUser }>,
): Promise<void> => {
  const voterGroup = await getVoterGroup(req.params.voterGroupId);
  res.status(HttpStatusCode.ok).json(voterGroup);
};
