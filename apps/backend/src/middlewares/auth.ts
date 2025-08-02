import { response401Object, response500Object } from '@repo/votura-validators';
import type { NextFunction, Request, Response } from 'express';
import type { AccessTokenPayload } from '../auth/types.js';
import { getBearerToken, verifyToken } from '../auth/utils.js';
import { HttpStatusCode } from '../httpStatusCode.js';
import { findUserBy, isAccessTokenBlacklisted } from '../services/users.service.js';

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
        .json(response401Object.parse({ message: 'Access token is required. Are you logged in?' }));
      return;
    }

    // Verify token
    const decodedToken = verifyToken(bearerToken);

    if (decodedToken === null || decodedToken.type !== 'access') {
      res
        .status(HttpStatusCode.unauthorized)
        .json(response401Object.parse({ message: 'Invalid access token.' }));
      return;
    }
    const decodedAccessToken = decodedToken as AccessTokenPayload;

    // Check if token is blacklisted
    const isBlacklisted: boolean = await isAccessTokenBlacklisted(decodedAccessToken.jti);
    if (isBlacklisted) {
      res
        .status(HttpStatusCode.unauthorized)
        .json(
          response401Object.parse({ message: 'Invalid access token. Token has been revoked.' }),
        );
      return;
    }

    // Check if the user exists in the database
    const user = await findUserBy({ id: decodedAccessToken.sub });

    if (user === null) {
      res
        .status(HttpStatusCode.unauthorized)
        .json(response401Object.parse({ message: 'User claimed by access token does not exist.' }));
      return;
    }

    res.locals.user = user;
    res.locals.accessTokenPayload = decodedAccessToken;

    next();
  } catch {
    res
      .status(HttpStatusCode.internalServerError)
      .json(response500Object.parse({ message: 'Internal server error during authentication.' }));
  }
};
