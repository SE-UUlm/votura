import type { SelectableUser, SelectableVoterGroup } from '@repo/votura-validators';
import type { Request, Response } from 'express';
import { HttpStatusCode } from '../../httpStatusCode.js';
import { getVoterGroupsForUser } from '../../services/voterGroups.service.js';

export const getVoterGroups = async (
  _req: Request,
  res: Response<SelectableVoterGroup[], { user: SelectableUser }>,
): Promise<void> => {
  const voterGroups = await getVoterGroupsForUser(res.locals.user.id);
  res.status(HttpStatusCode.ok).json(voterGroups);
};
