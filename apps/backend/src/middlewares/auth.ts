import { type NextFunction, type Request, type Response } from 'express';
import type { Response401 } from '@repo/votura-validators';
import { findUserBy } from '../services/users.service.js';

export const auth = async (req: Request, res: Response, next: NextFunction) => {
  // IMPLEMENT AUTHENTICATION HERE
  const user = await findUserBy({ email: 'user@votura.org' });

  if (!user) {
    const response: Response401 = {
      message: 'Invalid authentication, please check your credentials.',
    };
    res.status(401).send(response);
  } else {
    res.locals.user = user;
    next();
  }
};
