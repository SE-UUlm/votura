import type { Response401, SelectableUser } from '@repo/votura-validators';
import type { Request, Response } from 'express';
import type { AccessTokenPayload } from '../../auth/types.js';
import { HttpStatusCode } from '../../httpStatusCode.js';
import { logoutUser } from '../../services/users.service.js';

export type LogoutResponse = Response<
  void | Response401,
  { user: SelectableUser; accessTokenPayload: AccessTokenPayload }
>;

export const logout = async (_req: Request, res: LogoutResponse): Promise<void> => {
  await logoutUser(res.locals.accessTokenPayload, res.locals.user.id);

  res.sendStatus(HttpStatusCode.noContent);
};
