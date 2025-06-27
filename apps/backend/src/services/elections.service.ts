import type {
  Election,
  InsertableElection,
  SelectableElection,
  UpdateableElection,
  User,
} from '@repo/votura-validators';
import type { Selectable } from 'kysely';
import { db } from '../db/database.js';
import type { Election as KyselyElection } from '../db/types/db.js';
import { spreadableOptional } from '../utils.js';

export const electionTransformer = (election: Selectable<KyselyElection>): Election => {
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

export const getElections = async (userId: User['id']): Promise<SelectableElection[]> => {
  const elections = await db
    .selectFrom('Election')
    .selectAll()
    .where('electionCreatorId', '=', userId)
    .execute();

  return elections.map((kyselyElection) => electionTransformer(kyselyElection));
};

export const getElection = async (
  electionId: Election['id'],
  userId: User['id'],
): Promise<SelectableElection | null> => {
  const election = await db
    .selectFrom('Election')
    .where('id', '=', electionId)
    .where('electionCreatorId', '=', userId)
    .selectAll()
    .executeTakeFirst();

  if (election === undefined) {
    return null;
  }

  return electionTransformer(election);
};

export const updateElection = async (
  updateableElection: UpdateableElection,
  electionId: Election['id'],
): Promise<SelectableElection | null> => {
  const election = await db
    .updateTable('Election')
    .set({ ...updateableElection })
    .where('id', '=', electionId)
    .returningAll()
    .executeTakeFirst();

  if (election === undefined) {
    return null;
  }

  return electionTransformer(election);
};

export const deleteElection = async (electionId: Election['id']): Promise<boolean> => {
  const result = await db.deleteFrom('Election').where('id', '=', electionId).executeTakeFirst();

  if (result.numDeletedRows < 1n) {
    return false;
  }
  return true;
};
