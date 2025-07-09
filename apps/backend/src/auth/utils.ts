import { db } from '@repo/db';
import type { ApiTokenUser } from '@repo/votura-validators';
import crypto from 'crypto';
import type { Request } from 'express';
import jwt from 'jsonwebtoken';
import ms from 'ms';
import { JWT_CONFIG } from './jwtConfig.js';
import type { AccessTokenPayload, JwtPayload, RefreshTokenPayload } from './types.js';

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
  const decoded = jwt.decode(token) as JwtPayload;
  return new Date(decoded.exp * 1000);
};

export const verifyToken = (token: string): JwtPayload | null => {
  try {
    const verifyOptions: jwt.VerifyOptions = {
      algorithms: [JWT_CONFIG.algorithm],
    };

    return jwt.verify(token, getKeys().publicKey, verifyOptions) as JwtPayload;
  } catch {
    return null; // Token is invalid or expired
  }
};

export const isTokenBlacklisted = async (tokenId: string): Promise<boolean> => {
  const blacklistedToken = await db
    .selectFrom('accessTokenBlacklist')
    .select('accessTokenId')
    .where('accessTokenId', '=', tokenId)
    .where('expiresAt', '>', new Date())
    .executeTakeFirst();

  if (blacklistedToken === undefined) {
    return false; // Token is not blacklisted
  }
  return true; // Token is blacklisted
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
