import {
  type Response400,
  type Response404,
  response4XXObject,
  type SelectableUser,
} from '@repo/votura-validators';
import type { Request, Response } from 'express';
import type { AccessTokenPayload } from '../../auth/types.js';
import { HttpStatusCode } from '../../httpStatusCode.js';
import { setUserVerified, updateUserPassword } from '../../services/users.service.js';
import { isBodyCheckValidationError } from '../.bodyChecks/bodyCheckValidationError.js';
import { validateSetInitialPasswordRequest } from '../.bodyChecks/userChecks/setInitialPasswordRequest.check.js';

export type SetInitialPasswordResponse = Response<
  void | Response400 | Response404,
  { user: SelectableUser; accessTokenPayload: AccessTokenPayload }
>;

export const setInitialPassword = async (
  req: Request,
  res: SetInitialPasswordResponse,
): Promise<void> => {
  const validationResult = await validateSetInitialPasswordRequest(req.body);
  if (isBodyCheckValidationError(validationResult)) {
    res
      .status(validationResult.status)
      .json(response4XXObject.parse({ message: validationResult.message }));
    return;
  }

  // Update the password and allow the user to log in
  await updateUserPassword(validationResult.userId, validationResult.newPassword);
  await setUserVerified(validationResult.userId);

  res.status(HttpStatusCode.noContent).send();
};
