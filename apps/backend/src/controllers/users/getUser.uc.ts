import type { SelectableUser } from '@repo/votura-validators';
import type { Request, Response } from 'express';
import { HttpStatusCode } from '../../httpStatusCode.js';

export const getUser = (
  _req: Request,
  res: Response<SelectableUser, { user: SelectableUser }>,
): void => {
  res.status(HttpStatusCode.ok).json(res.locals.user);
};
