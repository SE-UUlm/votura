import {
  type Response403,
  response403Object,
  response404Object,
  type SelectableUser,
  type User,
} from '@repo/votura-validators';
import type { Request, Response } from 'express';
import { HttpStatusCode } from '../../httpStatusCode.js';
import { findUserBy } from '../../services/users.service.js';

export const getUser = async (
  req: Request<{ userId: User['id'] }>,
  res: Response<SelectableUser | Response403, { user: SelectableUser }>,
): Promise<void> => {
  const currentUser = res.locals.user;
  if (currentUser.role !== 'admin' && req.params.userId !== currentUser.id) {
    res.status(HttpStatusCode.forbidden).json(
      response403Object.parse({
        message: 'You do not have permission to access this user.',
      }),
    );
    return;
  }

  const requestedUser = await findUserBy({ id: req.params.userId });
  if (requestedUser === null) {
    res.status(HttpStatusCode.notFound).json(
      response404Object.parse({
        message: 'User not found.',
      }),
    );
    return;
  }

  res.status(HttpStatusCode.ok).json(requestedUser);
};
