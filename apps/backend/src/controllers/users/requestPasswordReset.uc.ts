import {
  requestPasswordResetUserObject,
  zodErrorToResponse400,
  type Response400,
} from '@repo/votura-validators';
import type { Request, Response } from 'express';
import { generatePasswordResetToken, hashPasswordResetToken } from '../../auth/utils.js';
import { HttpStatusCode } from '../../httpStatusCode.js';
import { sendPasswordResetEmail } from '../../mail/mailer.js';
import { findDBUserBy, setPasswordResetToken } from '../../services/users.service.js';

/** Time-to-live for a password reset token in milliseconds (1 hour). */
const PASSWORD_RESET_TOKEN_TTL_MS = 60 * 60 * 1000;

export type RequestPasswordResetResponse = Response<void | Response400>;

export const requestPasswordReset = async (
  req: Request,
  res: RequestPasswordResetResponse,
): Promise<void> => {
  const { data, error, success } = await requestPasswordResetUserObject.safeParseAsync(req.body);
  if (!success) {
    res.status(HttpStatusCode.badRequest).json(zodErrorToResponse400(error));
    return;
  }

  const user = await findDBUserBy({ email: data.email });

  // A token is only issued if the account exists, but the response is always 204
  // so that the endpoint does not reveal which email addresses are registered.
  if (user !== null) {
    const rawToken = generatePasswordResetToken();
    const expiresAt = new Date(Date.now() + PASSWORD_RESET_TOKEN_TTL_MS);

    await setPasswordResetToken(user.id, hashPasswordResetToken(rawToken), expiresAt);
    await sendPasswordResetEmail(user.email, rawToken);
  }

  res.sendStatus(HttpStatusCode.noContent);
};
