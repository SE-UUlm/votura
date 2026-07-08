import {
  response429Object,
  response4XXObject,
  type ApiTokenUser,
  type Response400,
  type Response401,
  type Response403,
  type Response429,
} from '@repo/votura-validators';
import type { Request, Response } from 'express';
import { HttpStatusCode } from '../../httpStatusCode.js';
import { resetFailedLoginAttempts } from '../../services/loginAttempt.service.js';
import { createNewUserTokens } from '../../services/users.service.js';
import { isBodyCheckValidationError } from '../bodyChecks/bodyCheckValidationError.js';
import { validateLoginRequest } from '../bodyChecks/userChecks.js';

export type LoginResponse = Response<
  ApiTokenUser | Response400 | Response401 | Response403 | Response429
>;

export const login = async (req: Request, res: LoginResponse): Promise<void> => {
  const ipAddress = req.ip ?? '0.0.0.0';
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
