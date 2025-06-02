import { prisma } from '../client.js';
import { type User } from '../../generated/prisma/index.js';

//export const findUserById = (id: User['id']): Promise<User | null> => {
//  return prisma.user.findUnique({ where: { id: id } });
//};


/**
 * Creates a new user record in the database.
 * @param email – the user’s email address
 * @param passwordHash – the hashed password (Argon2id)
 * @returns a Promise resolving to the created User
 */
export async function createUser(
  email: string,
  passwordHash: string
): Promise<User> {
  const user: User = await prisma.user.create({
    data: {
      email: email,
      passwordHash: passwordHash,
    },
  });
  return user;
}

/**
 * Finds a user by their unique email.
 * @param email – the user’s email address
 * @returns a Promise resolving to the User or null if not found
 */
export async function getUserByEmail(
  email: string
): Promise<User | null> {
  const user: User | null = await prisma.user.findUnique({
    where: { email },
  });
  return user;
}