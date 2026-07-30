import {
  response4XXObject,
  type Response400,
  type Response401,
  type SelectableUser,
} from '@repo/votura-validators';
import type { Request, Response } from 'express';
import type { AccessTokenPayload } from '../../auth/types.js';
import { HttpStatusCode } from '../../httpStatusCode.js';
import { findDBUserBy, updateUserPassword } from '../../services/users.service.js';
import { isBodyCheckValidationError } from '../.bodyChecks/bodyCheckValidationError.js';
import { validateChangePasswordRequest } from '../.bodyChecks/userChecks/changePasswordRequest.check.js';

export type ChangePasswordResponse = Response<
  void | Response400 | Response401,
  { user: SelectableUser; accessTokenPayload: AccessTokenPayload }
>;

export const changePassword = async (
  req: Request,
  res: ChangePasswordResponse,
): Promise<void> => {
  const dbUser = await findDBUserBy({ id: res.locals.user.id });
  if (dbUser === null) {
    res
      .status(HttpStatusCode.unauthorized)
      .json(response4XXObject.parse({ message: 'User claimed by access token does not exist.' }));
    return;
  }

  const validationResult = await validateChangePasswordRequest(req.body, dbUser);
  if (isBodyCheckValidationError(validationResult)) {
    console.log(validationResult.message);

    res
      .status(validationResult.status)
      .json(response4XXObject.parse({ message: validationResult.message }));
    return;
  }

  await updateUserPassword(res.locals.user.id, validationResult.newPassword);
  res.sendStatus(HttpStatusCode.noContent);
};
