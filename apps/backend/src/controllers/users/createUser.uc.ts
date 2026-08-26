import type { Userrole } from '@repo/db/types';
import {
  createUserDataObject,
  response409Object,
  zodErrorToResponse400,
  type Response400,
  type Response409,
} from '@repo/votura-validators';
import type { Request, Response } from 'express';
import { HttpStatusCode } from '../../httpStatusCode.js';
import { sendAccountCreationEmail } from '../../mail/mailer.js';
import { createUser as createPersistentUser, findUserBy } from '../../services/users.service.js';

export type CreateUserResponse = Response<void | Response400 | Response409>;

const generateRandomPassword = (): string => {
  const upper = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const lower = 'abcdefghijklmnopqrstuvwxyz';
  const numbers = '0123456789';
  const special = '#?!@$%^&*-';
  const all = upper + lower + numbers + special;

  // Guarantee at least one character from each category
  const chars = [
    upper[Math.floor(Math.random() * upper.length)],
    lower[Math.floor(Math.random() * lower.length)],
    numbers[Math.floor(Math.random() * numbers.length)],
    special[Math.floor(Math.random() * special.length)],
  ];

  // Add another 28 characters, so we get to a total length of 32 characters
  for (let i = 0; i < 28; i++) {
    chars.push(all[Math.floor(Math.random() * all.length)]);
  }

  // Shift characters randomly
  for (let i = chars.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [chars[i], chars[j]] = [chars[j], chars[i]];
  }

  return chars.join('');
};

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

  const password = generateRandomPassword();

  await createPersistentUser({
    email: data.email,
    password: password,
    role: data.role as Userrole,
    active: true,
  });
  const createdUser = await findUserBy({ email: data.email });
  if (createdUser === null) {
    res.status(HttpStatusCode.conflict).json(
      response409Object.parse({
        message: 'Could not create user with this email address.',
      }),
    );
    return;
  }
  await sendAccountCreationEmail(data.email, createdUser.id, password);

  res.sendStatus(HttpStatusCode.noContent);
};
