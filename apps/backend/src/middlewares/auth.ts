import { type Request, type Response, type NextFunction } from 'express';
import { prisma } from '../client.js';
import { type User } from './../../generated/prisma/index.js';
import type { Response401 } from '@repo/votura-validators';

export const auth = async (req: Request, res: Response, next: NextFunction) => {
  // IMPLEMENT AUTHENTICATION HERE

  const user: User | null = await prisma.user.findUnique({ where: { email: 'user@votura.org' } });

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
