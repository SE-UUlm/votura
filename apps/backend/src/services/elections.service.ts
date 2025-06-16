import type { InsertableElection, SelectableElection, User } from '@repo/votura-validators';
import { db } from '../db/database.js';
import { spreadableOptional } from '../utils.js';

export const createElection = async (
  insertableElection: InsertableElection,
  userId: User['id'],
): Promise<SelectableElection | null> => {
  const election = await db
    .insertInto('Election')
    .values({
      ...insertableElection,
      electionCreatorId: userId,
    })
    .returningAll()
    .executeTakeFirst();

  if (election === undefined) {
    return null;
  }

  return {
    id: election.id,
    createdAt: election.createdAt.toISOString(),
    modifiedAt: election.modifiedAt.toISOString(),
    name: election.name,
    ...spreadableOptional(election, 'description'),
    private: election.private,
    votingStartAt: election.votingStartAt.toISOString(),
    votingEndAt: election.votingEndAt.toISOString(),
    allowInvalidVotes: election.allowInvalidVotes,
    configFrozen: election.configFrozen,
    ...spreadableOptional(election, 'pubKey'),
    ...spreadableOptional(election, 'primeP'),
    ...spreadableOptional(election, 'primeQ'),
    ...spreadableOptional(election, 'generator'),
  };
};
