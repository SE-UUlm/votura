import { db } from '../db/database.js';
import type { SelectableUser, User } from '@repo/votura-validators';

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
