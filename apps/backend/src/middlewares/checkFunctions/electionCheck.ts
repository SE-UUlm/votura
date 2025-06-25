import type { Election, User } from '@repo/votura-validators';
import { db } from '../../db/database.js';

export async function exitsElection(electionId: Election['id']): Promise<boolean> {
  const result = await db
    .selectFrom('Election')
    .select(['id'])
    .where('id', '=', electionId)
    .executeTakeFirst();

  return result !== undefined;
}

export async function isValidOwnerOfElection(
  electionId: Election['id'],
  userId: User['id'],
): Promise<boolean> {
  const result = await db
    .selectFrom('Election')
    .select(['id', 'electionCreatorId'])
    .where('id', '=', electionId)
    .where('electionCreatorId', '=', userId)
    .executeTakeFirst();

  return result !== undefined;
}
