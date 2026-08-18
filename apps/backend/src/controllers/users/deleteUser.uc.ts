import {
  type Response404,
  response404Object,
  type SelectableUser,
  type User,
} from '@repo/votura-validators';
import type { Request, Response } from 'express';
import { HttpStatusCode } from '../../httpStatusCode.js';
import { deleteUser as deletePersistentUser, findUserBy } from '../../services/users.service.js';

export const deleteUser = async (
  req: Request<{ userId: User['id'] }>,
  res: Response<void | Response404, { user: SelectableUser }>,
): Promise<void> => {
  const userToDelete = await findUserBy({ id: req.params.userId });
  if (userToDelete === null) {
    res.status(HttpStatusCode.notFound).json(
      response404Object.parse({
        message: 'User not found.',
      }),
    );
    return;
  }

  // Do not allow to delete own account (that could permanently brick the system when no one is able to log in)
  const currentUser = res.locals.user;
  if (userToDelete.id === currentUser.id) {
    res.status(HttpStatusCode.forbidden).json(
      response404Object.parse({
        message: 'You are not allowed to delete your own account.',
      }),
    );
    return;
  }

  await deletePersistentUser(userToDelete.id);
  res.sendStatus(HttpStatusCode.noContent);
};
