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