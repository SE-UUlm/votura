//import { prisma } from '../client.js';
//import { type User } from '../../generated/prisma/index.js';
import {db} from '../db/database.js';
import {type User} from '../db/db.types.js';

//export const findUserById = (id: User['id']): Promise<User | null> => {
//  return prisma.user.findUnique({ where: { id: id } });
//};

export async function findUserById(id: string): Promise<User | null> {
  const user: any | undefined = await db.selectFrom('User')
    .where('id', '=', id)
    .selectAll()
    .executeTakeFirst();
  return user === undefined ? null : (user as User);
}