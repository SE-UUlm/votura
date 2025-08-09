import { type ApiTokenUser, uuidObject } from '@repo/votura-validators';
import crypto from 'crypto';
import type { Request } from 'express';
import jwt from 'jsonwebtoken';
import ms from 'ms';
import { getVoterGroupPubKey } from '../services/voterGroups.service.js';
import { getVoterGroupIdForVoter } from '../services/voters.service.js';
import { JWT_CONFIG } from './jwtConfig.js';
import type {
  AccessTokenPayload,
  RefreshTokenPayload,
  UserJwtPayload,
  VoterJwtPayload,
} from './types.js';

let jwtKeys: { privateKey: string; publicKey: string } | null = null;

const getKeys = (): { privateKey: string; publicKey: string } => {
  if (jwtKeys !== null) {
    return jwtKeys;
  }

  const privateKey = process.env.USERS_JWT_PRIV_KEY;
  const publicKey = process.env.USERS_JWT_PUB_KEY;

  if (privateKey === undefined || publicKey === undefined) {
    throw new Error('USERS_JWT_PRIV_KEY and USERS_JWT_PUB_KEY environment variables must be set.');
  }

  jwtKeys = {
    privateKey: Buffer.from(privateKey, 'base64').toString('utf-8'),
    publicKey: Buffer.from(publicKey, 'base64').toString('utf-8'),
  };

  return jwtKeys;
};

export const generateUserTokens = (userid: string): ApiTokenUser => {
  // Access token with JTI for blacklisting
  const accessTokenId = crypto.randomUUID();
  const accessPayload: AccessTokenPayload = {
    sub: userid,
    type: 'access' as const,
    exp: Math.floor(Date.now() / 1000) + ms(JWT_CONFIG.accessTokenExpiresIn) / 1000,
    jti: accessTokenId,
  };

  const accessToken = jwt.sign(accessPayload, getKeys().privateKey, {
    algorithm: JWT_CONFIG.algorithm,
  });

  // Refresh token without JTI
  const refreshPayload: RefreshTokenPayload = {
    sub: userid,
    type: 'refresh' as const,
    exp: Math.floor(Date.now() / 1000) + ms(JWT_CONFIG.refreshTokenExpiresIn) / 1000,
  };

  const refreshToken = jwt.sign(refreshPayload, getKeys().privateKey, {
    algorithm: JWT_CONFIG.algorithm,
  });

  return { accessToken, refreshToken };
};

export const hashRefreshToken = (refreshToken: string): string => {
  return crypto.createHash('sha256').update(refreshToken).digest('hex');
};

export const getTokenExpiration = (token: string): Date => {
  const decoded = jwt.decode(token) as UserJwtPayload;
  return new Date(decoded.exp * 1000);
};

export const verifyUserToken = (token: string): UserJwtPayload | null => {
  try {
    const verifyOptions: jwt.VerifyOptions = {
      algorithms: [JWT_CONFIG.algorithm],
    };

    return jwt.verify(token, getKeys().publicKey, verifyOptions) as UserJwtPayload;
  } catch {
    return null; // Token is invalid or expired
  }
};

export const verifyVoterToken = async (token: string): Promise<VoterJwtPayload | null> => {
  try {
    const verifyOptions: jwt.VerifyOptions = {
      algorithms: [JWT_CONFIG.algorithm],
    };

    // get voter id from the token payload
    const decodedPayload = jwt.decode(token);
    const parseResult = uuidObject.safeParse(decodedPayload?.sub);

    if (!parseResult.success) {
      return null; // Invalid voter ID
    }
    const voterId = parseResult.data;

    // Get the public key from the voter group the voter ID is linked to
    const voterGroupId = await getVoterGroupIdForVoter(voterId);
    if (voterGroupId === null) {
      return null; // Voter group not found
    }
    const publicKey = await getVoterGroupPubKey(voterGroupId);
    if (publicKey === null) {
      return null; // Public key not set for voter group
    }

    return jwt.verify(token, publicKey, verifyOptions) as VoterJwtPayload;
  } catch {
    return null; // Token is invalid
  }
};

export const getBearerToken = (req: Request): string | null => {
  const authHeader = req.headers.authorization;

  if (authHeader === undefined) {
    return null;
  }

  const scheme = authHeader.split(' ')[0];
  const token = authHeader.split(' ').pop();

  if (scheme?.toLowerCase() !== 'bearer' || token === undefined) {
    return null;
  }

  return token;
};
