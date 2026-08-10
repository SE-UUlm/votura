import {
  response401Object,
  response403Object,
  response500Object,
  type SelectableUser,
} from '@repo/votura-validators';
import type { NextFunction, Request, Response } from 'express';
import type { AccessTokenPayload } from '../auth/types.js';
import { getBearerToken, verifyUserToken, verifyVoterToken } from '../auth/utils.js';
import { HttpStatusCode } from '../httpStatusCode.js';
import { findUserBy, isAccessTokenBlacklisted } from '../services/users.service.js';

export enum UserAuthErrorMessages {
  noToken = 'Access token is required. Are you logged in?',
  invalidToken = 'Invalid access token.',
  blacklisted = 'Invalid access token. Token has been revoked.',
  userNotFound = 'User claimed by access token does not exist.',
  noAdmin = 'User does not have access to this resource.',
  internal = 'Internal server error during authentication of user.',
}

/**
 * Middleware to authenticate requests using JWT access tokens
 * Also checks if the user exists in the database
 */
export const authenticateAccessToken = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const bearerToken = getBearerToken(req);

    if (bearerToken === null) {
      res
        .status(HttpStatusCode.unauthorized)
        .json(response401Object.parse({ message: UserAuthErrorMessages.noToken }));
      return;
    }

    // Verify token
    const decodedToken = verifyUserToken(bearerToken);

    if (decodedToken === null || decodedToken.type !== 'access') {
      res
        .status(HttpStatusCode.unauthorized)
        .json(response401Object.parse({ message: UserAuthErrorMessages.invalidToken }));
      return;
    }
    const decodedAccessToken = decodedToken as AccessTokenPayload;

    // Check if token is blacklisted
    const isBlacklisted: boolean = await isAccessTokenBlacklisted(decodedAccessToken.jti);
    if (isBlacklisted) {
      res
        .status(HttpStatusCode.unauthorized)
        .json(response401Object.parse({ message: UserAuthErrorMessages.blacklisted }));
      return;
    }

    // Check if the user exists in the database and is active
    const user = await findUserBy({ id: decodedAccessToken.sub });

    if (user === null) {
      res
        .status(HttpStatusCode.unauthorized)
        .json(response401Object.parse({ message: UserAuthErrorMessages.userNotFound }));
      return;
    }

    if (!user.active) {
      res
        .status(HttpStatusCode.unauthorized)
        .json(response401Object.parse({ message: UserAuthErrorMessages.userNotFound }));
      return;
    }

    res.locals.user = user;
    res.locals.accessTokenPayload = decodedAccessToken;

    next();
  } catch {
    res
      .status(HttpStatusCode.internalServerError)
      .json(response500Object.parse({ message: UserAuthErrorMessages.internal }));
  }
};

export const onlyAdmin = (req: Request, res: Response, next: NextFunction): void => {
  // Check if user local exists
  if (res.locals.user === null) {
    res
      .status(HttpStatusCode.unauthorized)
      .json(response401Object.parse({ message: UserAuthErrorMessages.userNotFound }));
    return;
  }

  const user = res.locals.user as SelectableUser;

  // Check if user is an admin
  if (user.role !== 'admin') {
    res
      .status(HttpStatusCode.forbidden)
      .json(response403Object.parse({ message: UserAuthErrorMessages.noAdmin }));
    return;
  }

  next();
};

export enum VoterAuthErrorMessages {
  noToken = 'Voter token is required. Have you provided one?',
  invalidToken = 'Invalid voter token.',
  internal = 'Internal server error during authentication of voter.',
}

export const authenticateVoterToken = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const bearerToken = getBearerToken(req);

    if (bearerToken === null) {
      res
        .status(HttpStatusCode.unauthorized)
        .json(response401Object.parse({ message: VoterAuthErrorMessages.noToken }));
      return;
    }

    // Verify token
    const decodedToken = await verifyVoterToken(bearerToken);

    if (decodedToken === null) {
      res
        .status(HttpStatusCode.unauthorized)
        .json(response401Object.parse({ message: VoterAuthErrorMessages.invalidToken }));
      return;
    }
    const decodedVoterToken = decodedToken;

    // set voterId in response locals
    res.locals.voterId = decodedVoterToken.sub;

    next();
  } catch {
    res
      .status(HttpStatusCode.internalServerError)
      .json(response500Object.parse({ message: VoterAuthErrorMessages.internal }));
  }
};
