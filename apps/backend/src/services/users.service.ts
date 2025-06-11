import { db } from '../db/database.js';
import type { User } from '../db/db.types.js';
import type { Selectable } from 'kysely';

export async function findUserById(id: Selectable<User>['id']): Promise<Selectable<User> | null> {
  const user: Selectable<User> | undefined = await db
    .selectFrom('User')
    .where('id', '=', id)
    .selectAll()
    .executeTakeFirst();
  return user === undefined ? null : user;
}
