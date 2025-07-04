import type {
  ApiTokenUser,
  InsertableUser,
  RefreshRequestUser,
  SelectableUser,
  User,
} from '@repo/votura-validators';
import argon2 from 'argon2';
import type { AccessTokenPayload } from '../auth/types.js';
import {
  generateUserTokens,
  getTokenExpiration,
  hashRefreshToken,
  verifyToken,
} from '../auth/utils.js';
import { db } from '../db/database.js';

export async function findUserBy(
  criteria: Partial<Pick<User, 'id' | 'email'>>,
): Promise<SelectableUser | null> {
  if (Object.keys(criteria).length === 0) {
    return null;
  }

  let query = db.selectFrom('User');

  if (criteria.id !== undefined) {
    query = query.where('id', '=', criteria.id);
  }

  if (criteria.email !== undefined) {
    query = query.where('email', '=', criteria.email);
  }

  const user = await query.selectAll().executeTakeFirst();

  if (user === undefined) {
    return null;
  }

  return {
    id: user.id,
    createdAt: user.createdAt.toISOString(),
    modifiedAt: user.modifiedAt.toISOString(),
    email: user.email,
  };
}

let pepper: string | null = null;

const getPepper = (): string => {
  if (pepper !== null) {
    return pepper;
  }

  const envPepper = process.env.PEPPER;
  if (envPepper === undefined || envPepper === '') {
    throw new Error(
      'PEPPER environment variable is not set or is empty. Set it to a non-empty string.',
    );
  }

  pepper = envPepper;
  return pepper;
};

export async function createUser(insertableUser: InsertableUser): Promise<boolean> {
  const hashedPassword = await argon2.hash(insertableUser.password + getPepper());

  const user = await db
    .insertInto('User')
    .values({
      email: insertableUser.email,
      passwordHash: hashedPassword,
    })
    .returningAll()
    .executeTakeFirst();

  if (user === undefined) {
    return false; // Failed to create user
  }
  return true; // User created successfully
}

export enum loginError {
  InvalidCredentials = 'Invalid credentials',
  UserNotVerified = 'User is not verified',
  Internal = 'User could not be logged in due to internal errors',
}

export const loginUser = async (
  credentials: InsertableUser,
): Promise<ApiTokenUser | loginError> => {
  // Find user by email
  const user = await db
    .selectFrom('User')
    .selectAll()
    .where('email', '=', credentials.email)
    .executeTakeFirst();

  if (user === undefined) {
    return loginError.InvalidCredentials; // User not found
  }

  // Verify password
  const isValidPassword: boolean = await argon2.verify(
    user.passwordHash,
    credentials.password + getPepper(),
  );
  if (!isValidPassword) {
    return loginError.InvalidCredentials; // Invalid password
  }

  // Check if user is verified
  if (!user.verified) {
    return loginError.UserNotVerified; // User not verified
  }

  // Generate new token pair
  const tokens = generateUserTokens(user.id);

  const updatedUser = await db
    .updateTable('User')
    .set({
      refreshTokenHash: hashRefreshToken(tokens.refreshToken),
      refreshTokenExpiresAt: getTokenExpiration(tokens.refreshToken),
    })
    .where('id', '=', user.id)
    .returningAll()
    .executeTakeFirst();

  if (updatedUser === undefined) {
    return loginError.Internal;
  }

  return tokens;
};

export enum refreshTokenError {
  InvalidToken = 'Invalid refresh token',
  UserNotFound = 'User not found',
  TokenExpired = 'Refresh token has expired',
  Internal = 'Tokens could not be updated due to internal server error',
}

export const refreshUserTokens = async (
  refreshRequest: RefreshRequestUser,
): Promise<ApiTokenUser | refreshTokenError> => {
  // Verify refresh token
  const decodedToken = verifyToken(refreshRequest.refreshToken);

  if (decodedToken === null || decodedToken.type !== 'refresh') {
    return refreshTokenError.InvalidToken;
  }

  // Get user and verify stored refresh token
  const user = await db
    .selectFrom('User')
    .selectAll()
    .where('id', '=', decodedToken.sub)
    .executeTakeFirst();

  if (user === undefined) {
    return refreshTokenError.UserNotFound;
  }

  // Check if refresh token matches stored hash
  const refreshTokenHash = hashRefreshToken(refreshRequest.refreshToken);
  if (user.refreshTokenHash !== refreshTokenHash) {
    return refreshTokenError.InvalidToken;
  }

  // Check if refresh token is expired
  if (!user.refreshTokenExpiresAt || user.refreshTokenExpiresAt < new Date()) {
    return refreshTokenError.TokenExpired;
  }

  // Generate new token pair
  const newTokens = generateUserTokens(user.id);

  const updatedUser = await db
    .updateTable('User')
    .set({
      refreshTokenHash: hashRefreshToken(newTokens.refreshToken),
      refreshTokenExpiresAt: getTokenExpiration(newTokens.refreshToken),
    })
    .where('id', '=', user.id)
    .returningAll()
    .execute();

  if (updatedUser === undefined) {
    return refreshTokenError.Internal;
  }

  return newTokens;
};

export const logoutUser = async (
  accessTokenPayload: AccessTokenPayload,
  userId: string,
): Promise<boolean> => {
  // Add access token to blacklist
  const expiresAt = new Date(accessTokenPayload.exp * 1000);

  const blacklistEntry = await db
    .insertInto('AccessTokenBlacklist')
    .values({
      accessTokenId: accessTokenPayload.jti,
      expiresAt: expiresAt,
    })
    .returningAll()
    .executeTakeFirst();

  if (blacklistEntry === undefined) {
    return false; // Failed to blacklist token
  }

  // Clear refresh token from user record
  const updatedUser = await db
    .updateTable('User')
    .set({
      refreshTokenHash: null,
      refreshTokenExpiresAt: null,
    })
    .where('id', '=', userId)
    .returningAll()
    .execute();

  if (updatedUser === undefined) {
    return false; // Failed to clear refresh token
  }
  return true; // User logged out successfully
};
