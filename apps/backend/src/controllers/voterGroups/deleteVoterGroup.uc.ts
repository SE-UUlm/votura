import type { SelectableUser, SelectableVoterGroup } from '@repo/votura-validators';
import type { Request, Response } from 'express';
import { HttpStatusCode } from '../../httpStatusCode.js';
import { deleteVoterGroup as deletePersistentVoterGroup } from '../../services/voterGroups.service.js';

export const deleteVoterGroup = async (
  req: Request<{ voterGroupId: SelectableVoterGroup['id'] }>,
  res: Response<void, { user: SelectableUser }>,
): Promise<void> => {
  await deletePersistentVoterGroup(req.params.voterGroupId);
  res.status(HttpStatusCode.noContent).send();
};
