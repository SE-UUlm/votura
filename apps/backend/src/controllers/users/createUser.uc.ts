import {
  createUserDataObject,
  response409Object,
  zodErrorToResponse400,
  type Response400,
  type Response409,
} from '@repo/votura-validators';
import type { Request, Response } from 'express';
import { HttpStatusCode } from '../../httpStatusCode.js';
import { findUserBy } from '../../services/users.service.js';

export type CreateUserResponse = Response<void | Response400 | Response409>;

export const createUser = async (req: Request, res: CreateUserResponse): Promise<void> => {
  const { data, error, success } = await createUserDataObject.safeParseAsync(req.body);

  if (!success) {
    res.status(HttpStatusCode.badRequest).json(zodErrorToResponse400(error));
    return;
  }

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

  // TODO: Create user
  // TODO: Send "welcome & set password" mail to new user

  res.sendStatus(HttpStatusCode.noContent);
};
