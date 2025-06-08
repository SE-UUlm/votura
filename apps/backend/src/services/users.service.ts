import { db } from '../db/database.js';
import { type User } from '../db/db.types.js';

export async function findUserById(id: string): Promise<User | null> {
  const user: any | undefined = await db
    .selectFrom('User')
    .where('id', '=', id)
    .selectAll()
    .executeTakeFirst();
  return user === undefined ? null : (user as User);
}
