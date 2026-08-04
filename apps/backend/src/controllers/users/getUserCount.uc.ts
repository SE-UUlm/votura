import { userCountObject, type UserCount } from '@repo/votura-validators';
import type { Request, Response } from 'express';
import { HttpStatusCode } from '../../httpStatusCode.js';
import { userCount as getPersistentUserCount } from '../../services/users.service.js';

export const getUserCount = async (_req: Request, res: Response<UserCount>): Promise<void> => {
  const count = await getPersistentUserCount();

  res.status(HttpStatusCode.ok).json(
    userCountObject.parse({
      count: count,
    }),
  );
};
