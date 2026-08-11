import {
  authenticatableUserObject,
  response409Object,
  response429Object,
  response4XXObject,
  response500Object,
  zodErrorToResponse400,
  type ApiTokenUser,
  type Response400,
  type Response401,
  type Response403,
  type Response409,
  type Response429,
} from '@repo/votura-validators';
import type { Request, Response } from 'express';
import { HttpStatusCode } from '../../httpStatusCode.js';
import { resetFailedLoginAttempts } from '../../services/loginAttempt.service.js';
import {
  createNewUserTokens,
  createUser,
  findUserBy,
  setUserVerified,
  userCount,
} from '../../services/users.service.js';
import { isBodyCheckValidationError } from '../.bodyChecks/bodyCheckValidationError.js';
import { validateLoginRequest } from '../.bodyChecks/userChecks/loginRequest.check.js';

export type LoginResponse = Response<
  ApiTokenUser | Response400 | Response401 | Response403 | Response409 | Response429
>;

const createInitialUser = async (req: Request, res: Response): Promise<boolean> => {
  const { data, error, success } = await authenticatableUserObject.safeParseAsync(req.body);

  // Check whether the request body has the correct format
  if (!success) {
    res.status(HttpStatusCode.badRequest).json(zodErrorToResponse400(error));
    return false;
  }

  // Check whether there already is a user with the given email
  // (For creating a new user, that should never be the case, but it's better to check for it than to return 500 responses)
  const existingUser = await findUserBy({ email: data.email });
  if (existingUser !== null) {
    res.status(HttpStatusCode.conflict).json(
      response409Object.parse({
        message: 'User with the provided email address already exists.',
      }),
    );
    return false;
  }

  // Create the user
  await createUser({ ...data, role: 'admin', active: true });

  // Check whether the user was really created
  const newUser = await findUserBy({ email: data.email });
  if (newUser === null) {
    res.status(HttpStatusCode.internalServerError).json(
      response500Object.parse({
        message: 'Failed to create the initial user.',
      }),
    );
    return false;
  }

  // Auto-verify the new user
  await setUserVerified(newUser.id);

  return true;
};

export const login = async (req: Request, res: LoginResponse): Promise<void> => {
  const ipAddress = req.ip ?? '0.0.0.0';
  // If there are no users in the DB, create a new one
  if ((await userCount()) === 0) {
    if (!(await createInitialUser(req, res))) {
      return; // Abort if initial account creation had failed
    }
  }

  // Begin login logic
  const validationResult = await validateLoginRequest(req.body, ipAddress);
  if (isBodyCheckValidationError(validationResult)) {
    if (validationResult.status === HttpStatusCode.tooManyRequests) {
      res.status(HttpStatusCode.tooManyRequests).json(
        response429Object.parse({
          message: validationResult.message,
          retryIn: validationResult.retryIn ?? { hours: 0, minutes: 0, seconds: 0 },
        }),
      );
      return;
    }

    res
      .status(validationResult.status)
      .json(response4XXObject.parse({ message: validationResult.message }));
    return;
  }

  await resetFailedLoginAttempts(ipAddress, validationResult);
  const loginResult = await createNewUserTokens(validationResult);
  res.status(HttpStatusCode.ok).json(loginResult);
};
