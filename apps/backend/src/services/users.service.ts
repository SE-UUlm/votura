import type { InsertableUser, SelectableUser, User } from '@repo/votura-validators';
import { db } from '../db/database.js';
import argon2 from 'argon2';
import { DefaultColumnName, UserColumnName, TableName } from '../db/nameEnums.js';

export async function findUserBy(
  criteria: Partial<Pick<User, 'id' | 'email'>>,
): Promise<SelectableUser | null> {
  if (Object.keys(criteria).length === 0) {
    return null;
  }

  let query = db.selectFrom(TableName.User);

  if (criteria.id !== undefined) {
    query = query.where(DefaultColumnName.id, '=', criteria.id);
  }

  if (criteria.email !== undefined) {
    query = query.where(UserColumnName.email, '=', criteria.email);
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

export async function createUser(insertableUser: InsertableUser): Promise<boolean> {
  const pepper: string | undefined = process.env.PEPPER;
  if (pepper === undefined) {
    throw new Error('PEPPER environment variable is not set. Set it to a non-empty string.');
  }

  const hashedPassword = await argon2.hash(insertableUser.password + pepper);

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
