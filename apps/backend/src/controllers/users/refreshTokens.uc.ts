import {
  response4XXObject,
  type ApiTokenUser,
  type Response400,
  type Response401,
} from '@repo/votura-validators';
import type { Request, Response } from 'express';
import { HttpStatusCode } from '../../httpStatusCode.js';
import { createNewUserTokens } from '../../services/users.service.js';
import { isBodyCheckValidationError } from '../bodyChecks/bodyCheckValidationError.js';
import { validateTokenRefreshRequest } from '../bodyChecks/userChecks.js';

export type RefreshTokensResponse = Response<ApiTokenUser | Response400 | Response401>;

export const refreshTokens = async (req: Request, res: RefreshTokensResponse): Promise<void> => {
  const validationResult = await validateTokenRefreshRequest(req.body);
  if (isBodyCheckValidationError(validationResult)) {
    res
      .status(validationResult.status)
      .json(response4XXObject.parse({ message: validationResult.message }));
    return;
  }

  const refreshResults = await createNewUserTokens(validationResult);
  res.status(HttpStatusCode.ok).json(refreshResults);
};
