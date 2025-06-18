import type {
  Election,
  InsertableElection,
  SelectableElection,
  User,
} from '@repo/votura-validators';
import { db } from '../db/database.js';
import { spreadableOptional } from '../utils.js';
import type { Selectable } from 'kysely';
import type { Election as KysleyElection } from '../db/types/db.js';

export const electionTransformer = (election: Selectable<KysleyElection>): Election => {
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

  return electionTransformer(election);
};

export const getAllElections = async (userId: User['id']): Promise<SelectableElection[]> => {
  const elections = await db
    .selectFrom('Election')
    .selectAll()
    .where('electionCreatorId', '=', userId)
    .execute();

  return elections.map((kysleyElection) => electionTransformer(kysleyElection));
};
