import { db } from '@repo/db';
import type { Election as KyselyElection } from '@repo/db/types';
import type {
  Election,
  InsertableElection,
  SelectableElection,
  UpdateableElection,
  User,
} from '@repo/votura-validators';
import type { KeyPair } from '@votura/votura-crypto/index';
import type { DeleteResult, Selectable } from 'kysely';
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
): Promise<SelectableElection> => {
  const election = await db
    .insertInto('election')
    .values({
      ...insertableElection,
      electionCreatorId: userId,
    })
    .returningAll()
    .executeTakeFirstOrThrow();

  return electionTransformer(election);
};

export const getDBElections = async (userId: User['id']): Promise<Selectable<KyselyElection>[]> => {
  return db.selectFrom('election').selectAll().where('electionCreatorId', '=', userId).execute();
};

export const getElections = async (userId: User['id']): Promise<SelectableElection[]> => {
  const elections = await getDBElections(userId);

  return elections.map((kyselyElection) => electionTransformer(kyselyElection));
};

export const getElection = async (
  electionId: Election['id'],
  userId: User['id'],
): Promise<SelectableElection> => {
  const election = await db
    .selectFrom('election')
    .where('id', '=', electionId)
    .where('electionCreatorId', '=', userId)
    .selectAll()
    .executeTakeFirstOrThrow();

  return electionTransformer(election);
};

export const updateElection = async (
  updateableElection: UpdateableElection,
  electionId: Election['id'],
): Promise<SelectableElection> => {
  const election = await db
    .updateTable('election')
    .set({ ...updateableElection })
    .where('id', '=', electionId)
    .returningAll()
    .executeTakeFirstOrThrow();

  return electionTransformer(election);
};

export const setElectionKeys = async (
  keyPair: KeyPair,
  electionId: Election['id'],
): Promise<SelectableElection> => {
  const election = await db
    .updateTable('election')
    .set({
      pubKey: keyPair.publicKey.publicKey.toString(),
      privKey: keyPair.privateKey.privateKey.toString(),
      primeP: keyPair.publicKey.primeP.toString(),
      primeQ: keyPair.publicKey.primeQ.toString(),
      generator: keyPair.publicKey.generator.toString(),
    })
    .where('id', '=', electionId)
    .returningAll()
    .executeTakeFirstOrThrow();

  return electionTransformer(election);
};

export const unfreezeElection = async (electionId: Election['id']): Promise<SelectableElection> => {
  const election = await db
    .updateTable('election')
    .set({
      configFrozen: false,
      pubKey: null,
      privKey: null,
      primeP: null,
      primeQ: null,
      generator: null,
    })
    .where('id', '=', electionId)
    .returningAll()
    .executeTakeFirstOrThrow();

  // TODO: Add here the functionality to delete all voter tokens that have access to this election. (see #214)
  // Think about using a transaction here to ensure consistency.
  // https://kysely.dev/docs/category/transactions

  return electionTransformer(election);
};

/**
 * Sets the election to frozen and returns the updated election.
 *
 * @param electionId The ID of the election to update.
 * @returns The updated election.
 */
export const freezeElection = async (electionId: Election['id']): Promise<SelectableElection> => {
  const election = await db
    .updateTable('election')
    .set({ configFrozen: true })
    .where('id', '=', electionId)
    .returningAll()
    .executeTakeFirstOrThrow();

  return electionTransformer(election);
};

export const checkElectionsNotFrozen = async (electionIds: Election['id'][]): Promise<boolean> => {
  const elections = await db
    .selectFrom('election')
    .where('id', 'in', electionIds)
    .where('configFrozen', '=', false)
    .select('id')
    .execute();

  return elections.length === electionIds.length;
};

export const deleteElection = async (electionId: Election['id']): Promise<DeleteResult> => {
  return db.deleteFrom('election').where('id', '=', electionId).executeTakeFirst();
};
