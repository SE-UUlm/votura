import type { Election, User } from '@repo/votura-validators';
import { db } from '../../db/database.js';

export async function electionExists(electionId: Election['id']): Promise<boolean> {
  // Checks if the election with the given ID exists in the database.
  const result = await db
    .selectFrom('Election')
    .select(['id'])
    .where('id', '=', electionId)
    .limit(1)
    .executeTakeFirst();

  if (result === undefined) {
    return false;
  }
  return true;
}

export async function validOwnerOfElection(
  electionId: Election['id'],
  userId: User['id'],
): Promise<boolean> {
  // Checks if the user with the given ID is the owner of the election with the given ID.
  const result = await db
    .selectFrom('Election')
    .select(['id', 'electionCreatorId'])
    .where('id', '=', electionId)
    .where('electionCreatorId', '=', userId)
    .limit(1)
    .executeTakeFirst();

  if (result === undefined) {
    return false;
  }
  return true;
}
