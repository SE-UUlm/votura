import type { SelectableUser } from '@repo/votura-validators';
import type { Request, Response } from 'express';
import { HttpStatusCode } from '../../httpStatusCode.js';
import { deleteUser as deletePersistentUser } from '../../services/users.service.js';

export const deleteUser = async (
  _req: Request,
  res: Response<void, { user: SelectableUser }>,
): Promise<void> => {
  await deletePersistentUser(res.locals.user.id);
  res.sendStatus(HttpStatusCode.noContent);
};
