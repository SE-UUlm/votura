import { response4XXObject, type Response400, type Response401 } from '@repo/votura-validators';
import type { Request, Response } from 'express';
import { HttpStatusCode } from '../../httpStatusCode.js';
import { resetUserPassword } from '../../services/users.service.js';
import { isBodyCheckValidationError } from '../.bodyChecks/bodyCheckValidationError.js';
import { validateResetPasswordRequest } from '../.bodyChecks/userChecks/resetPasswordRequest.check.js';

export type ResetPasswordResponse = Response<void | Response400 | Response401>;

export const resetPassword = async (req: Request, res: ResetPasswordResponse): Promise<void> => {
  const validationResult = await validateResetPasswordRequest(req.body);
  if (isBodyCheckValidationError(validationResult)) {
    res
      .status(validationResult.status)
      .json(response4XXObject.parse({ message: validationResult.message }));
    return;
  }

  await resetUserPassword(validationResult.userId, validationResult.password);

  res.sendStatus(HttpStatusCode.noContent);
};
