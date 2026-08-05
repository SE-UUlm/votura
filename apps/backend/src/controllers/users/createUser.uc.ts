import {
  authenticatableUserObject,
  response409Object,
  zodErrorToResponse400,
  type Response400,
  type Response409,
} from '@repo/votura-validators';
import type { Request, Response } from 'express';
import { HttpStatusCode } from '../../httpStatusCode.js';
import { createUser as createPersistentUser, findUserBy } from '../../services/users.service.js';

export type CreateUserResponse = Response<void | Response400 | Response409>;

export const createUser = async (req: Request, res: CreateUserResponse): Promise<void> => {
  const body: unknown = req.body;

  const { data, error, success } = await authenticatableUserObject.safeParseAsync(body);

  if (success) {
    // Check if a user with the provided email already exists
    const user = await findUserBy({
      email: data.email,
    });
    if (user !== null) {
      res.status(HttpStatusCode.conflict).json(
        response409Object.parse({
          message: 'User with the provided email address already exists.',
        }),
      );
      return;
    }

    await createPersistentUser({ ...data, role: 'user' });

    res.sendStatus(HttpStatusCode.noContent);
  } else {
    res.status(HttpStatusCode.badRequest).json(zodErrorToResponse400(error));
  }
};
