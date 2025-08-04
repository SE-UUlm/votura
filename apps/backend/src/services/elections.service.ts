import { db } from '@repo/db';
import type { Election as DBElection, User as DBUser } from '@repo/db/types';
import type {
  InsertableElection,
  SelectableElection,
  UpdateableElection,
} from '@repo/votura-validators';
import type { KeyPair } from '@votura/votura-crypto/index';
import type { DeleteResult, Selectable } from 'kysely';
import { spreadableOptional } from '../utils.js';
import { getVoterGroupsLinkedToElection } from './voterGroups.service.js';

const electionTransformer = (election: Selectable<DBElection>): SelectableElection => {
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
  userId: Selectable<DBUser>['id'],
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

export const getElections = async (
  userId: Selectable<DBUser>['id'],
): Promise<SelectableElection[]> => {
  const elections = await db
    .selectFrom('election')
    .selectAll()
    .where('electionCreatorId', '=', userId)
    .execute();

  return elections.map((kyselyElection) => electionTransformer(kyselyElection));
};

export const getElection = async (
  electionId: Selectable<DBElection>['id'],
  userId: Selectable<DBUser>['id'],
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
  electionId: Selectable<DBElection>['id'],
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
  electionId: Selectable<DBElection>['id'],
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

export const unfreezeElection = async (
  electionId: Selectable<DBElection>['id'],
): Promise<SelectableElection> => {
  const voterGroupIds = await getVoterGroupsLinkedToElection(electionId);

  const unfrozenElection = await db.transaction().execute(async (trx) => {
    // Delete the pub keys from the voter groups linked to this election
    if (voterGroupIds.length > 0) {
      await trx
        .updateTable('voterGroup')
        .set({
          pubKey: null,
        })
        .where('id', 'in', voterGroupIds)
        .execute();
    }

    // Unfreeze the election and remove its keys
    return trx
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

    // TODO: Add here the functionality to remove the votes from the election and
    // all other elections related to the same voter groups (see #272).
  });

  return electionTransformer(unfrozenElection);
};

/**
 * Sets the election to frozen and returns the updated election.
 *
 * @param electionId The ID of the election to update.
 * @returns The updated election.
 */
export const freezeElection = async (
  electionId: Selectable<DBElection>['id'],
): Promise<SelectableElection> => {
  const election = await db
    .updateTable('election')
    .set({ configFrozen: true })
    .where('id', '=', electionId)
    .returningAll()
    .executeTakeFirstOrThrow();

  return electionTransformer(election);
};

export const deleteElection = async (
  electionId: Selectable<DBElection>['id'],
): Promise<DeleteResult> => {
  return db.deleteFrom('election').where('id', '=', electionId).executeTakeFirst();
};

export const checkElectionExists = async (
  electionId: Selectable<DBElection>['id'],
): Promise<boolean> => {
  const result = await db
    .selectFrom('election')
    .select('id')
    .where('id', '=', electionId)
    .executeTakeFirst();

  return result !== undefined;
};

export const isUserOwnerOfElection = async (
  electionId: Selectable<DBElection>['id'],
  userId: Selectable<DBUser>['id'],
): Promise<boolean> => {
  const result = await db
    .selectFrom('election')
    .select('id')
    .where('id', '=', electionId)
    .where('electionCreatorId', '=', userId)
    .executeTakeFirst();

  return result !== undefined;
};

/**
 * Checks if the election with the given ID is frozen.
 * @param electionId The ID of the election to check.
 * @returns True if the election is frozen, false otherwise.
 */
export const isElectionFrozen = async (
  electionId: Selectable<DBElection>['id'],
): Promise<boolean> => {
  const result = await db
    .selectFrom('election')
    .select('id')
    .where('id', '=', electionId)
    .where('configFrozen', '=', true)
    .executeTakeFirst();

  return result !== undefined;
};

/**
 * Checks if the election with the given ID is currently generating keys.
 * @param electionId The ID of the election to check.
 * @returns True if the election is generating keys, false otherwise.
 */
export const isElectionGeneratingKeys = async (
  electionId: Selectable<DBElection>['id'],
): Promise<boolean> => {
  const result = await db
    .selectFrom('election')
    .select(['id', 'pubKey', 'configFrozen'])
    .where('id', '=', electionId)
    .executeTakeFirstOrThrow();

  return result.pubKey === null && result.configFrozen;
};

/**
 * Gets the voting start date of the election with the given ID.
 * Expects that the election exists.
 * @param electionId The ID of the election to check.
 * @returns The voting start date of the election.
 */
export const getElectionVotingStart = async (
  electionId: Selectable<DBElection>['id'],
): Promise<Date> => {
  const result = await db
    .selectFrom('election')
    .select('votingStartAt')
    .where('id', '=', electionId)
    .executeTakeFirstOrThrow();

  return result.votingStartAt;
};
