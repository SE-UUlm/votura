import { db } from '@repo/db';
import type { User as DBUser } from '@repo/db/types';
import { hashPassword, verifyPassword } from '@repo/hash';
import type {
  ApiTokenUser,
  InsertableUser,
  RefreshRequestUser,
  SelectableUser,
  User,
} from '@repo/votura-validators';
import type { Selectable } from 'kysely';
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

export async function createUser(insertableUser: InsertableUser): Promise<void> {
  const hashedPassword = await hashPassword(insertableUser.password, getPepper());

  await db
    .insertInto('user')
    .values({
      email: insertableUser.email,
      passwordHash: hashedPassword,
    })
    .executeTakeFirstOrThrow();
}

export async function setUserVerified(userId: Selectable<DBUser>['id']): Promise<void> {
  await db
    .updateTable('user')
    .set({ verified: true })
    .where('id', '=', userId)
    .executeTakeFirstOrThrow();
}

export async function deleteUser(userId: Selectable<DBUser>['id']): Promise<void> {
  await db.deleteFrom('user').where('id', '=', userId).executeTakeFirstOrThrow();
}

export async function blacklistAccessToken(accessTokenId: string, expiresAt: Date): Promise<void> {
  await db
    .insertInto('accessTokenBlacklist')
    .values({
      accessTokenId: accessTokenId,
      expiresAt: expiresAt,
    })
    .executeTakeFirstOrThrow();
}

export enum LoginError {
  invalidCredentials = 'Invalid credentials',
  userNotVerified = 'User is not verified',
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

  await db
    .updateTable('user')
    .set({
      refreshTokenHash: hashRefreshToken(tokens.refreshToken),
      refreshTokenExpiresAt: getTokenExpiration(tokens.refreshToken),
    })
    .where('id', '=', user.id)
    .executeTakeFirstOrThrow();

  return tokens;
};

export enum RefreshTokenError {
  invalidToken = 'Invalid refresh token',
  userNotFound = 'User not found',
  tokenExpired = 'Refresh token has expired',
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
  if (user.refreshTokenExpiresAt === null || user.refreshTokenExpiresAt < new Date()) {
    return RefreshTokenError.tokenExpired;
  }

  // Generate new token pair
  const newTokens = generateUserTokens(user.id);

  await db
    .updateTable('user')
    .set({
      refreshTokenHash: hashRefreshToken(newTokens.refreshToken),
      refreshTokenExpiresAt: getTokenExpiration(newTokens.refreshToken),
    })
    .where('id', '=', user.id)
    .executeTakeFirstOrThrow();

  return newTokens;
};

export const logoutUser = async (
  accessTokenPayload: AccessTokenPayload,
  userId: Selectable<DBUser>['id'],
): Promise<void> => {
  // Add access token to blacklist
  const expiresAt = new Date(accessTokenPayload.exp * 1000);

  await blacklistAccessToken(accessTokenPayload.jti, expiresAt);

  // Clear refresh token from user record
  await db
    .updateTable('user')
    .set({
      refreshTokenHash: null,
      refreshTokenExpiresAt: null,
    })
    .where('id', '=', userId)
    .executeTakeFirstOrThrow();
};
