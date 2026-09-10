import type { Request, Response } from 'express';

export const createUser = (_req: Request, res: Response<void>): void => {
  // TODO #505: https://github.com/SE-UUlm/votura/issues/505
  res.sendStatus(501);
};
