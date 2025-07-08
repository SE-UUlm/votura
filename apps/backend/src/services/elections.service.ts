import type {
  Election,
  InsertableElection,
  SelectableElection,
  UpdateableElection,
  User,
} from '@repo/votura-validators';
import type { KeyPair } from '@votura/votura-crypto/index';
import type { DeleteResult, Selectable } from 'kysely';
import { db } from '../db/database.js';
import type { Election as KyselyElection } from '../db/types/db.js';
import { spreadableOptional } from '../utils.js';

const electionTransformer = (election: Selectable<KyselyElection>): SelectableElection => {
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
    .insertInto('election')
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
    .selectFrom('election')
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
    .selectFrom('election')
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
    .updateTable('election')
    .set({ ...updateableElection })
    .where('id', '=', electionId)
    .returningAll()
    .executeTakeFirst();

  if (election === undefined) {
    return null;
  }

  return electionTransformer(election);
};

export const setElectionKeys = async (
  keyPair: KeyPair,
  electionId: Election['id'],
): Promise<SelectableElection | null> => {
  const election = await db
    .updateTable('Election')
    .set({
      pubKey: keyPair.publicKey.publicKey.toString(),
      privKey: keyPair.privateKey.privateKey.toString(),
      primeP: keyPair.publicKey.primeP.toString(),
      primeQ: keyPair.publicKey.primeQ.toString(),
      generator: keyPair.publicKey.generator.toString(),
    })
    .where('id', '=', electionId)
    .returningAll()
    .executeTakeFirst();

  if (election === undefined) {
    return null;
  }

  return electionTransformer(election);
};

/**
 * Sets the election to frozen or unfrozen state and returns the updated election.
 * If the election was not found, it returns null.
 *
 * @param electionId The ID of the election to update.
 * @param configFrozen The new `configFrozen` state of the election.
 * @returns The updated election or null if not found.
 */
export const setElectionFrozenState = async (
  electionId: Election['id'],
  configFrozen: boolean,
): Promise<SelectableElection | null> => {
  const election = await db
    .updateTable('election')
    .set({ configFrozen: configFrozen })
    .where('id', '=', electionId)
    .returningAll()
    .executeTakeFirst();

  if (election === undefined) {
    return null;
  }

  return electionTransformer(election);
};

export const deleteElection = async (electionId: Election['id']): Promise<DeleteResult> => {
  return db.deleteFrom('election').where('id', '=', electionId).executeTakeFirst();
};
