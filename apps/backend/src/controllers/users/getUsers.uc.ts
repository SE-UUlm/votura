import type { Request, Response } from 'express';

export const getUsers = (_req: Request, res: Response<void>): void => {
  // TODO #503: https://github.com/SE-UUlm/votura/issues/503
  res.sendStatus(501);
};
