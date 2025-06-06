import { prisma } from '../client.js';
import { type User } from '../../generated/prisma/index.js';

export const findUserById = (id: User['id']): Promise<User | null> => {
  return prisma.user.findUnique({ where: { id: id } });
};
