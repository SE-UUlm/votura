import type { InsertableUser } from '@repo/votura-validators';
import { db } from '../db/database.js';
import type { SelectableUser, User } from '@repo/votura-validators';
import argon2 from 'argon2';

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

export async function createUser(insertableUser: InsertableUser): Promise<boolean> {
  const PEPPER = process.env.PEPPER;
  if (!PEPPER) {
    throw new Error('PEPPER environment variable is not set');
  }

  const hashedPassword = await argon2.hash(insertableUser.password + PEPPER);

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
