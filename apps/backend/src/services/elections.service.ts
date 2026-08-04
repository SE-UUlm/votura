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

/**
 * Persists the generated key pair for an election.
 *
 * The update is guarded (compare-and-swap on `keyGenStartedAt`): it only applies if the election
 * is still frozen, has no keys yet and still belongs to the key generation run identified by
 * `keyGenStartedAt`. This prevents a slow key generation from writing keys onto an election
 * that was unfrozen (or re-frozen, starting a new run) in the meantime.
 *
 * @param keyPair The generated key pair to persist.
 * @param electionId The ID of the election to update.
 * @param keyGenStartedAt The token of the key generation run that produced the key pair.
 * @returns The updated election, or null if the result was stale and has been discarded.
 */
export const setElectionKeys = async (
  keyPair: KeyPair,
  electionId: Selectable<DBElection>['id'],
  keyGenStartedAt: Date,
): Promise<SelectableElection | null> => {
  const election = await db
    .updateTable('election')
    .set({
      pubKey: keyPair.publicKey.getPublicKey().toString(),
      privKey: keyPair.privateKey.getPrivateKey().toString(),
      primeP: keyPair.publicKey.getPrimeP().toString(),
      primeQ: keyPair.publicKey.getPrimeQ().toString(),
      generator: keyPair.publicKey.getGenerator().toString(),
      keyGenStartedAt: null,
    })
    .where('id', '=', electionId)
    .where('configFrozen', '=', true)
    .where('pubKey', 'is', null)
    .where('keyGenStartedAt', '=', keyGenStartedAt)
    .returningAll()
    .executeTakeFirst();

  return election === undefined ? null : electionTransformer(election);
};

/**
 * Clears the key generation marker of an election after a failed key generation run.
 *
 * The update is guarded (compare-and-swap on `keyGenStartedAt`) so that only the marker of the
 * failed run identified by `keyGenStartedAt` is cleared and a newer run is left untouched.
 * Clearing the marker allows the election to be unfrozen again immediately.
 *
 * @param electionId The ID of the election to update.
 * @param keyGenStartedAt The token of the failed key generation run.
 */
export const clearKeyGenStartedAt = async (
  electionId: Selectable<DBElection>['id'],
  keyGenStartedAt: Date,
): Promise<void> => {
  await db
    .updateTable('election')
    .set({ keyGenStartedAt: null })
    .where('id', '=', electionId)
    .where('keyGenStartedAt', '=', keyGenStartedAt)
    .execute();
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
        keyGenStartedAt: null,
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
 * Sets the election to frozen, marks the start of the key generation run and
 * returns the updated election together with the key generation token.
 *
 * The token (`keyGenStartedAt`) is generated in JS (millisecond precision) and must be passed
 * unchanged to {@link setElectionKeys} / {@link clearKeyGenStartedAt} so their guarded updates
 * can match it exactly.
 *
 * @param electionId The ID of the election to update.
 * @returns The updated election and the key generation token.
 */
export const freezeElection = async (
  electionId: Selectable<DBElection>['id'],
): Promise<{ election: SelectableElection; keyGenStartedAt: Date }> => {
  const keyGenStartedAt = new Date();

  const election = await db
    .updateTable('election')
    .set({ configFrozen: true, keyGenStartedAt })
    .where('id', '=', electionId)
    .returningAll()
    .executeTakeFirstOrThrow();

  return { election: electionTransformer(election), keyGenStartedAt };
};

export const deleteElection = async (
  electionId: Selectable<DBElection>['id'],
): Promise<DeleteResult> => {
  return db.deleteFrom('election').where('id', '=', electionId).executeTakeFirst();
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

const minutesToMilliseconds = 60 * 1000;

/**
 * Checks if the election with the given ID is currently generating keys.
 *
 * An election only counts as generating keys while its key generation marker (`keyGenStartedAt`)
 * is set and younger than the configured timeout (`KEY_GEN_TIMEOUT_MINUTES`, default 15 minutes).
 * A missing marker (key generation failed or crashed before the marker existed) or an expired
 * marker (backend died mid key generation) means the run is considered failed, so the election
 * can be unfrozen again (see #242).
 *
 * @param electionId The ID of the election to check.
 * @returns True if the election is generating keys, false otherwise.
 */
export const isElectionGeneratingKeys = async (
  electionId: Selectable<DBElection>['id'],
): Promise<boolean> => {
  const result = await db
    .selectFrom('election')
    .select(['id', 'pubKey', 'configFrozen', 'keyGenStartedAt'])
    .where('id', '=', electionId)
    .executeTakeFirstOrThrow();

  if (result.pubKey !== null || !result.configFrozen || result.keyGenStartedAt === null) {
    return false;
  }

  const keyGenTimeoutMinutes = parseInt(process.env.KEY_GEN_TIMEOUT_MINUTES ?? '15', 10);

  return (
    Date.now() - result.keyGenStartedAt.getTime() < keyGenTimeoutMinutes * minutesToMilliseconds
  );
};
