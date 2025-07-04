import type { ApiTokenUser } from '@repo/votura-validators';
import crypto from 'crypto';
import jwt from 'jsonwebtoken';
import ms from 'ms';
import { JWT_CONFIG } from '../auth/jwtConfig.js';
import type { JwtPayload } from '../auth/types.js';
import { db } from '../db/database.js';

let jwtKeys: { privateKey: string; publicKey: string } | null = null;

const getKeys = (): { privateKey: string; publicKey: string } => {
  if (jwtKeys !== null) {
    return jwtKeys;
  }

  const privateKey = process.env.JWT_PRIVATE_KEY;
  const publicKey = process.env.JWT_PUBLIC_KEY;

  if (privateKey === undefined || publicKey === undefined) {
    throw new Error('JWT_PRIVATE_KEY and JWT_PUBLIC_KEY environment variables must be set.');
  }

  jwtKeys = {
    privateKey: Buffer.from(privateKey, 'base64').toString('utf-8'),
    publicKey: Buffer.from(publicKey, 'base64').toString('utf-8'),
  };

  return jwtKeys;
};

export const generateUserTokens = async (userid: string): Promise<ApiTokenUser> => {
  jwtKeys = getKeys();

  // Access token with JTI for blacklisting
  const accessTokenId = crypto.randomUUID();
  const accessPayload: JwtPayload = {
    sub: userid,
    type: 'access' as const,
    exp: Math.floor(Date.now() / 1000) + ms(JWT_CONFIG.ACCESS_TOKEN_EXPIRES_IN) / 1000,
    jti: accessTokenId,
  };

  const accessToken = jwt.sign(accessPayload, jwtKeys.privateKey, {
    algorithm: JWT_CONFIG.ALGORITHM,
  });

  // Refresh token without JTI
  const refreshPayload: JwtPayload = {
    sub: userid,
    type: 'refresh' as const,
    exp: Math.floor(Date.now() / 1000) + ms(JWT_CONFIG.REFRESH_TOKEN_EXPIRES_IN) / 1000,
  };

  const refreshToken = jwt.sign(refreshPayload, jwtKeys.privateKey, {
    algorithm: JWT_CONFIG.ALGORITHM,
  });

  return { accessToken, refreshToken };
};

export const hashRefreshToken = (refreshToken: string): string => {
  return crypto.createHash('sha256').update(refreshToken).digest('hex');
};

export const getTokenExpiration = (token: string): Date => {
  const decoded = jwt.decode(token) as JwtPayload;
  return new Date(decoded.exp * 1000);
};

export const verifyToken = (token: string): JwtPayload | null => {
  jwtKeys = getKeys();
  try {
    const verifyOptions: jwt.VerifyOptions = {
      algorithms: [JWT_CONFIG.ALGORITHM],
    };

    const decoded = jwt.verify(token, jwtKeys.publicKey, verifyOptions) as JwtPayload;

    return decoded;
  } catch (error) {
    return null; // Token is invalid or expired
  }
};

export const isTokenBlacklisted = async (tokenId: string): Promise<boolean> => {
  const blacklistedToken = await db
    .selectFrom('AccessTokenBlacklist')
    .select('accessTokenId')
    .where('accessTokenId', '=', tokenId)
    .where('expiresAt', '>', new Date())
    .executeTakeFirst();

  if (blacklistedToken === undefined) {
    return false; // Token is not blacklisted
  }
  return true; // Token is blacklisted
};
