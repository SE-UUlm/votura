import { db } from '@repo/db';
import type {
  AccessTokenBlacklist as DBAccessTokenBlacklist,
  User as DBUser,
} from '@repo/db/types';
import { getPepper, hashPassword } from '@repo/hash';
import type {
  ApiTokenUser,
  EditUserData,
  InsertableUser,
  SelectableUser,
  User,
} from '@repo/votura-validators';
import type { Selectable } from 'kysely';
import type { AccessTokenPayload } from '../auth/types.js';
import { generateUserTokens, getTokenExpiration, hashRefreshToken } from '../auth/utils.js';

const dbUserToSelectableUser = (user: Selectable<DBUser>): SelectableUser => {
  return {
    id: user.id,
    createdAt: user.createdAt.toISOString(),
    modifiedAt: user.modifiedAt.toISOString(),
    email: user.email,
    role: user.role,
    active: user.active,
  };
};

export async function findDBUserBy(
  criteria: Partial<Pick<User, 'id' | 'email'>>,
): Promise<Selectable<DBUser> | null> {
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
  return user;
}

export async function findUserBy(
  criteria: Partial<Pick<User, 'id' | 'email'>>,
): Promise<SelectableUser | null> {
  const user = await findDBUserBy(criteria);

  if (user === null) {
    return null;
  }

  return dbUserToSelectableUser(user);
}

export async function createUser(insertableUser: InsertableUser): Promise<void> {
  const hashedPassword = await hashPassword(insertableUser.password, getPepper());

  await db
    .insertInto('user')
    .values({
      email: insertableUser.email,
      passwordHash: hashedPassword,
      role: insertableUser.role,
      active: insertableUser.active,
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

export async function updateUserPassword(
  userId: Selectable<DBUser>['id'],
  newPassword: string,
): Promise<void> {
  const hashedPassword = await hashPassword(newPassword, getPepper());

  await db
    .updateTable('user')
    .set({
      passwordHash: hashedPassword,
    })
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

export const createNewUserTokens = async (
  userId: Selectable<DBUser>['id'],
): Promise<ApiTokenUser> => {
  const tokens = generateUserTokens(userId);

  await db
    .updateTable('user')
    .set({
      refreshTokenHash: hashRefreshToken(tokens.refreshToken),
      refreshTokenExpiresAt: getTokenExpiration(tokens.refreshToken),
    })
    .where('id', '=', userId)
    .executeTakeFirstOrThrow();

  return tokens;
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

export const isAccessTokenBlacklisted = async (
  tokenId: DBAccessTokenBlacklist['accessTokenId'],
): Promise<boolean> => {
  const blacklistedToken = await db
    .selectFrom('accessTokenBlacklist')
    .select('accessTokenId')
    .where('accessTokenId', '=', tokenId)
    .where('expiresAt', '>', new Date())
    .executeTakeFirst();

  return blacklistedToken !== undefined; // Return true if token is blacklisted, false otherwise
};

export const userCount = async (): Promise<number> => {
  const userCountResponse = await db
    .selectFrom('user')
    .select((b) => b.fn.count('user.id').as('count'))
    .executeTakeFirst();

  return Number(userCountResponse?.count ?? 0);
};

export const getAllUsers = async (): Promise<SelectableUser[]> => {
  const allDbUsers = await db.selectFrom('user').selectAll().execute();
  return allDbUsers.map(dbUserToSelectableUser);
};

export const editUser = async (user: SelectableUser, editUserData: EditUserData): Promise<void> => {
  await db
    .updateTable('user')
    .set('role', editUserData.role)
    .set('active', editUserData.active)
    .where('id', '=', user.id)
    .executeTakeFirstOrThrow();
};
