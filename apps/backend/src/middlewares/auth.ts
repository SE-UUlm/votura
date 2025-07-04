import type { Response401 } from '@repo/votura-validators';
import type { NextFunction, Request, Response } from 'express';
import { response500Object, response401Object } from '@repo/votura-validators';
import { isTokenBlacklisted, verifyToken } from '../auth/utils.js';
import { HttpStatusCode } from '../httpStatusCode.js';
import { findUserBy } from '../services/users.service.js';

export interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
  };
}

// Middleware to authenticate requests using JWT access tokens
// Also checks if the user exists in the database
export const authenticateAccessToken = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1]; // Bearer token

    if (token === undefined) {
      res
        .status(HttpStatusCode.Unauthorized)
        .json(response401Object.parse({ message: 'Access token is required. Are you logged in?' }));
      return;
    }

    // Verify token
    const decodedToken = verifyToken(token);

    if (decodedToken === null || decodedToken.type !== 'access' || decodedToken.jti === undefined) {
      res
        .status(HttpStatusCode.Unauthorized)
        .json(response401Object.parse({ message: 'Invalid access token.' }));
      return;
    }

    // Check if token is blacklisted
    const isBlacklisted: boolean = await isTokenBlacklisted(decodedToken.jti);
    if (isBlacklisted) {
      res
        .status(HttpStatusCode.Unauthorized)
        .json(
          response401Object.parse({ message: 'Invalid access token. Token has been revoked.' }),
        );
      return;
    }

    // Check if the user exists in the database
    const user = await findUserBy({ id: decodedToken.sub });

    if (user === null) {
      res
        .status(HttpStatusCode.Unauthorized)
        .json(response401Object.parse({ message: 'User claimed by access token does not exist.' }));
      return;
    }

    req.user = {
      id: decodedToken.sub,
    };

    next();
  } catch (error) {
    res
      .status(HttpStatusCode.InternalServerError)
      .json(response500Object.parse({ message: 'Internal server error during authentication.' }));
  }
};
