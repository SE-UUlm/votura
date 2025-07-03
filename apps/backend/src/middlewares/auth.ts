import type { Response401 } from '@repo/votura-validators';
import type { NextFunction, Request, Response } from 'express';
import { findUserBy } from '../services/users.service.js';

export const auth = async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
  // IMPLEMENT AUTHENTICATION HERE
  const user = await findUserBy({ email: 'user@votura.org' });

  if (user === null) {
    const response: Response401 = {
      message: 'Invalid authentication, please check your credentials.',
    };
    res.status(401).send(response);
  } else {
    res.locals.user = user;
    next();
  }
};
