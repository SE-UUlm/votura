import {
  editUserDataObject,
  type Response403,
  response403Object,
  response404Object,
  type SelectableUser,
  type User,
  zodErrorToResponse400,
} from '@repo/votura-validators';
import type { Request, Response } from 'express';
import { HttpStatusCode } from '../../httpStatusCode.js';
import { editUser as editPersistentUser, findUserBy } from '../../services/users.service.js';

export const editUser = async (
  req: Request<{ userId: User['id'] }>,
  res: Response<SelectableUser | Response403, { user: SelectableUser }>,
): Promise<void> => {
  const requestedUser = await findUserBy({ id: req.params.userId });
  if (requestedUser === null) {
    res.status(HttpStatusCode.notFound).json(
      response404Object.parse({
        message: 'User not found.',
      }),
    );
    return;
  }

  // Do not allow to edit own account (that could permanently brick the system when no one is able to log in)
  const currentUser = res.locals.user;
  if (requestedUser.id === currentUser.id) {
    res.status(HttpStatusCode.forbidden).json(
      response403Object.parse({
        message: 'You are not allowed to edit your own account.',
      }),
    );
    return;
  }

  // Parse and validate request body
  const { data, error, success } = await editUserDataObject.safeParseAsync(req.body);
  if (!success) {
    res.status(HttpStatusCode.badRequest).json(zodErrorToResponse400(error));
    return;
  }

  // Update user in DB and send HTTP response
  await editPersistentUser(requestedUser, data);
  res.sendStatus(HttpStatusCode.noContent);
};
