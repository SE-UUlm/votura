import { db } from '@repo/db';
import { hashPassword, verifyPassword } from '@repo/hash';
import type {
  ApiTokenUser,
  InsertableUser,
  RefreshRequestUser,
  SelectableUser,
  User,
} from '@repo/votura-validators';
import type { AccessTokenPayload } from '../auth/types.js';
import {
  generateUserTokens,
  getTokenExpiration,
  hashRefreshToken,
  verifyToken,
} from '../auth/utils.js';

export async function findUserBy(
  criteria: Partial<Pick<User, 'id' | 'email'>>,
): Promise<SelectableUser | null> {
  if (Object.keys(criteria).length === 0) {
    return null;
  }

  let query = db.selectFrom('user');

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
  const hashedPassword = await hashPassword(insertableUser.password, getPepper());

  const user = await db
    .insertInto('user')
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

export async function verifyUser(userId: string): Promise<boolean> {
  const updatedUser = await db
    .updateTable('user')
    .set({ verified: true })
    .where('id', '=', userId)
    .returningAll()
    .executeTakeFirst();

  if (updatedUser === undefined) {
    return false; // Failed to verify user
  }
  return true; // User verified successfully
}

export async function deleteUser(userId: string): Promise<boolean> {
  const deletedUser = await db
    .deleteFrom('user')
    .where('id', '=', userId)
    .returningAll()
    .executeTakeFirst();

  if (deletedUser === undefined) {
    return false; // Failed to delete user
  }
  return true; // User deleted successfully
}

export async function blacklistAccessToken(
  accessTokenId: string,
  expiresAt: Date,
): Promise<boolean> {
  const blacklistEntry = await db
    .insertInto('accessTokenBlacklist')
    .values({
      accessTokenId: accessTokenId,
      expiresAt: expiresAt,
    })
    .returningAll()
    .executeTakeFirst();

  if (blacklistEntry === undefined) {
    return false; // Failed to blacklist token
  }
  return true; // Token blacklisted successfully
}

export enum LoginError {
  invalidCredentials = 'Invalid credentials',
  userNotVerified = 'User is not verified',
  internal = 'User could not be logged in due to internal errors',
}

export const loginUser = async (
  credentials: InsertableUser,
): Promise<ApiTokenUser | LoginError> => {
  // Find user by email
  const user = await db
    .selectFrom('user')
    .selectAll()
    .where('email', '=', credentials.email)
    .executeTakeFirst();

  if (user === undefined) {
    return LoginError.invalidCredentials; // User not found
  }

  // Verify password
  const isValidPassword: boolean = await verifyPassword(
    user.passwordHash,
    credentials.password,
    getPepper(),
  );
  if (!isValidPassword) {
    return LoginError.invalidCredentials; // Invalid password
  }

  // TODO: Uncomment when user verification is implemented (see issue #125)
  // Check if user is verified
  //if (!user.verified) {
  //  return loginError.UserNotVerified; // User not verified
  //}

  // Generate new token pair
  const tokens = generateUserTokens(user.id);

  const updatedUser = await db
    .updateTable('user')
    .set({
      refreshTokenHash: hashRefreshToken(tokens.refreshToken),
      refreshTokenExpiresAt: getTokenExpiration(tokens.refreshToken),
    })
    .where('id', '=', user.id)
    .returningAll()
    .executeTakeFirst();

  if (updatedUser === undefined) {
    return LoginError.internal;
  }
  return tokens;
};

export enum RefreshTokenError {
  invalidToken = 'Invalid refresh token',
  userNotFound = 'User not found',
  tokenExpired = 'Refresh token has expired',
  internal = 'Tokens could not be updated due to internal server error',
}

export const refreshUserTokens = async (
  refreshRequest: RefreshRequestUser,
): Promise<ApiTokenUser | RefreshTokenError> => {
  // Verify refresh token
  const decodedToken = verifyToken(refreshRequest.refreshToken);

  if (decodedToken === null || decodedToken.type !== 'refresh') {
    return RefreshTokenError.invalidToken;
  }

  // Get user and verify stored refresh token
  const user = await db
    .selectFrom('user')
    .selectAll()
    .where('id', '=', decodedToken.sub)
    .executeTakeFirst();

  if (user === undefined) {
    return RefreshTokenError.userNotFound;
  }

  // Check if refresh token matches stored hash
  const refreshTokenHash = hashRefreshToken(refreshRequest.refreshToken);
  if (user.refreshTokenHash !== refreshTokenHash) {
    return RefreshTokenError.invalidToken;
  }

  // Check if refresh token is expired
  if (!user.refreshTokenExpiresAt || user.refreshTokenExpiresAt < new Date()) {
    return RefreshTokenError.tokenExpired;
  }

  // Generate new token pair
  const newTokens = generateUserTokens(user.id);

  const updatedUser = await db
    .updateTable('user')
    .set({
      refreshTokenHash: hashRefreshToken(newTokens.refreshToken),
      refreshTokenExpiresAt: getTokenExpiration(newTokens.refreshToken),
    })
    .where('id', '=', user.id)
    .returningAll()
    .executeTakeFirst();

  if (updatedUser === undefined) {
    return RefreshTokenError.internal;
  }

  return newTokens;
};

export const logoutUser = async (
  accessTokenPayload: AccessTokenPayload,
  userId: string,
): Promise<boolean> => {
  // Add access token to blacklist
  const expiresAt = new Date(accessTokenPayload.exp * 1000);

  const blacklisted = await blacklistAccessToken(accessTokenPayload.jti, expiresAt);

  if (!blacklisted) {
    return false; // Failed to blacklist access token
  }

  // Clear refresh token from user record
  const updatedUser = await db
    .updateTable('user')
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
