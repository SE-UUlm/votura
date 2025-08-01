import { db } from '@repo/db';
import type {
  DB,
  BallotPaper as DBBallotPaper,
  User as DBUser,
  Voter as DBVoter,
  VoterGroup as DBVoterGroup,
} from '@repo/db/types';
import type { InsertableVoterGroup, SelectableVoterGroup } from '@repo/votura-validators';
import type { Selectable, Transaction } from 'kysely';
import { arraysEqual, spreadableOptional } from '../utils.js';

export async function createVoters(
  voterGroupId: Selectable<DBVoterGroup>['id'],
  numberOfVoters: number,
  trx: Transaction<DB>,
): Promise<string[]> {
  // insert the voters into the database
  const voterEntries = Array.from({ length: numberOfVoters }, () => ({
    voterGroupId: voterGroupId,
  }));

  const voters = await trx.insertInto('voter').values(voterEntries).returning('id').execute();

  // check if the number of created voters matches the expected number
  if (voters.length !== numberOfVoters) {
    throw new Error(`Expected to create ${numberOfVoters} voters, but created ${voters.length}`);
  }

  return voters.map((voter) => voter.id);
}

export async function linkVotersToBallotPapers(
  voterIds: Selectable<DBVoter>['id'][],
  ballotPaperIds: Selectable<DBBallotPaper>['id'][],
  trx: Transaction<DB>,
): Promise<void> {
  const voterRegisterEntries = voterIds.flatMap((voterId) =>
    ballotPaperIds.map((ballotPaperId) => ({
      voterId: voterId,
      ballotPaperId: ballotPaperId,
    })),
  );

  const voterRegisterResult = await trx
    .insertInto('voterRegister')
    .values(voterRegisterEntries)
    .returning('id')
    .execute();

  // check if the number of created voter register entries matches the expected number
  if (voterRegisterResult.length !== voterIds.length * ballotPaperIds.length) {
    throw new Error(
      `Expected to create ${voterIds.length * ballotPaperIds.length} voter register entries, but created ${voterRegisterResult.length}`,
    );
  }
}

export async function getNumberOfVotersInGroup(
  voterGroupId: Selectable<DBVoterGroup>['id'],
): Promise<number> {
  const result = await db
    .selectFrom('voter')
    .where('voterGroupId', '=', voterGroupId)
    .select((eb) => eb.fn.count<number>('id').as('count'))
    .executeTakeFirstOrThrow();

  return Number(result.count);
}

export async function getVoterIdsForVoterGroup(
  voterGroupId: Selectable<DBVoterGroup>['id'],
): Promise<Selectable<DBVoter>['id'][]> {
  const voterIds = await db
    .selectFrom('voter')
    .where('voterGroupId', '=', voterGroupId)
    .select('id')
    .execute();

  return voterIds.map((voter) => voter.id);
}

export async function getBallotPaperIdsForVoterGroup(
  voterGroupId: Selectable<DBVoterGroup>['id'],
): Promise<string[]> {
  const ballotPaperIds = await db
    .selectFrom('voter')
    .innerJoin('voterRegister', 'voter.id', 'voterRegister.voterId')
    .where('voter.voterGroupId', '=', voterGroupId)
    .select('voterRegister.ballotPaperId')
    .distinct()
    .execute();

  return ballotPaperIds.map((row) => row.ballotPaperId);
}

async function voterGroupTransformer(
  voterGroup: Selectable<DBVoterGroup>,
): Promise<SelectableVoterGroup> {
  return {
    id: voterGroup.id,
    modifiedAt: voterGroup.modifiedAt.toISOString(),
    createdAt: voterGroup.createdAt.toISOString(),
    name: voterGroup.name,
    ...spreadableOptional(voterGroup, 'description'),
    numberOfVoters: await getNumberOfVotersInGroup(voterGroup.id),
    ballotPapers: await getBallotPaperIdsForVoterGroup(voterGroup.id),
  };
}

export async function createVoterGroup(
  insertableVoterGroup: InsertableVoterGroup,
  userId: DBVoterGroup['voterGroupCreatorId'],
): Promise<SelectableVoterGroup> {
  const voterGroup = await db.transaction().execute(async (trx) => {
    // Create the voter group
    const voterGroup = await trx
      .insertInto('voterGroup')
      .values({
        name: insertableVoterGroup.name,
        description: insertableVoterGroup.description,
        voterGroupCreatorId: userId,
      })
      .returningAll()
      .executeTakeFirstOrThrow();

    // Create voters within the transaction
    const voterIds = await createVoters(voterGroup.id, insertableVoterGroup.numberOfVoters, trx);

    // Link voters to ballot papers if any exist
    if (insertableVoterGroup.ballotPapers.length !== 0) {
      await linkVotersToBallotPapers(voterIds, insertableVoterGroup.ballotPapers, trx);
    }

    return voterGroup;
  });

  return voterGroupTransformer(voterGroup);
}

export async function getVoterGroupsForUser(
  userId: Selectable<DBUser>['id'],
): Promise<SelectableVoterGroup[]> {
  const voterGroups = await db
    .selectFrom('voterGroup')
    .where('voterGroupCreatorId', '=', userId)
    .selectAll()
    .execute();

  return Promise.all(voterGroups.map(async (voterGroup) => voterGroupTransformer(voterGroup)));
}

export async function checkVoterGroupExists(
  voterGroupId: Selectable<DBVoterGroup>['id'],
): Promise<boolean> {
  const result = await db
    .selectFrom('voterGroup')
    .select('id')
    .where('id', '=', voterGroupId)
    .executeTakeFirst();

  return result !== undefined;
}

export async function getOwnerOfVoterGroup(
  voterGroupId: Selectable<DBVoterGroup>['id'],
): Promise<string> {
  const result = await db
    .selectFrom('voterGroup')
    .select('voterGroupCreatorId')
    .where('id', '=', voterGroupId)
    .executeTakeFirstOrThrow();

  return result.voterGroupCreatorId;
}

export async function checkVoterGroupElectionsNotFrozen(
  voterGroupId: Selectable<DBVoterGroup>['id'],
): Promise<boolean> {
  const frozenElection = await db
    .selectFrom('voterGroup as vg')
    .innerJoin('voter as v', 'v.voterGroupId', 'vg.id')
    .innerJoin('voterRegister as vr', 'vr.voterId', 'v.id')
    .innerJoin('ballotPaper as bp', 'bp.id', 'vr.ballotPaperId')
    .innerJoin('election as e', 'e.id', 'bp.electionId')
    .select('e.id')
    .where('vg.id', '=', voterGroupId)
    .where('e.configFrozen', '=', true)
    .limit(1) // Stop at first frozen election found
    .executeTakeFirst();

  return frozenElection === undefined;
}

export async function getVoterGroup(
  voterGroupId: Selectable<DBVoterGroup>['id'],
): Promise<SelectableVoterGroup> {
  const voterGroup = await db
    .selectFrom('voterGroup')
    .where('id', '=', voterGroupId)
    .selectAll()
    .executeTakeFirstOrThrow();

  return voterGroupTransformer(voterGroup);
}

/**
 * Randomly removes a specified number of voters from a voter group.
 * Enough voters must exist in the group to remove the specified number.
 *
 * @param voterGroupId - The ID of the voter group.
 * @param numberOfVoters - The number of voters to remove.
 * @param trx - The database transaction to use.
 */
export async function removeVotersFromGroup(
  voterGroupId: Selectable<DBVoterGroup>['id'],
  numberOfVoters: number,
  trx: Transaction<DB>,
): Promise<void> {
  // Delete the voters from the voter table
  await trx
    .deleteFrom('voter')
    .where(
      'id',
      'in',
      trx
        .selectFrom('voter')
        .select('id')
        .where('voterGroupId', '=', voterGroupId)
        .limit(numberOfVoters),
    )
    .executeTakeFirstOrThrow();
}

export async function clearVoterRegisterForVoterGroup(
  voterGroupId: Selectable<DBVoterGroup>['id'],
  trx: Transaction<DB>,
): Promise<void> {
  // Delete all voter register entries for the specified voter group
  await trx
    .deleteFrom('voterRegister')
    .where(
      'voterId',
      'in',
      trx.selectFrom('voter').select('id').where('voterGroupId', '=', voterGroupId),
    )
    .execute();
}

export async function updateVoterGroup(
  voterGroupId: Selectable<DBVoterGroup>['id'],
  insertableVoterGroup: InsertableVoterGroup,
): Promise<SelectableVoterGroup> {
  const existingVoterGroup = await getVoterGroup(voterGroupId);
  const voterCountDelta = insertableVoterGroup.numberOfVoters - existingVoterGroup.numberOfVoters;
  let voterIdsToLink: Selectable<DBVoter>['id'][] = []; // Voter IDs to link to ballot papers in insertableVoterGroup

  // Wrap all operations in a single transaction to ensure consistency
  const updatedVoterGroup = await db.transaction().execute(async (trx) => {
    // Handle voter count changes first
    if (voterCountDelta < 0) {
      await removeVotersFromGroup(voterGroupId, Math.abs(voterCountDelta), trx);
    } else if (voterCountDelta > 0) {
      // Create new voters and store their IDs, voter register entries are added later
      voterIdsToLink = await createVoters(voterGroupId, voterCountDelta, trx);
    }

    if (!arraysEqual(existingVoterGroup.ballotPapers, insertableVoterGroup.ballotPapers)) {
      // Ballot papers changed - need to update voter register entries
      await clearVoterRegisterForVoterGroup(voterGroupId, trx);

      // Create new voter register entries for all voters in the group
      if (insertableVoterGroup.ballotPapers.length > 0) {
        const groupVoterIds = await trx
          .selectFrom('voter')
          .select('id')
          .where('voterGroupId', '=', voterGroupId)
          .execute();

        voterIdsToLink = groupVoterIds.map((voter) => voter.id);
      }
    }

    // link voters to ballot papers
    if (voterIdsToLink.length > 0 && insertableVoterGroup.ballotPapers.length > 0) {
      // Link voters to ballot papers
      await linkVotersToBallotPapers(voterIdsToLink, insertableVoterGroup.ballotPapers, trx);
    }

    // Update the voter group name and description
    return trx
      .updateTable('voterGroup')
      .set({
        name: insertableVoterGroup.name,
        description: insertableVoterGroup.description,
      })
      .where('id', '=', voterGroupId)
      .returningAll()
      .executeTakeFirstOrThrow();
  });

  return voterGroupTransformer(updatedVoterGroup);
}

export async function deleteVoterGroup(
  voterGroupId: Selectable<DBVoterGroup>['id'],
): Promise<void> {
  // deletes all voters and voter registers associated with the voter group
  // because of foreign key constraints
  await db.deleteFrom('voterGroup').where('id', '=', voterGroupId).executeTakeFirstOrThrow();
}

/**
 * Updates the public key for a voter group.
 * @param voterGroupId - The ID of the voter group.
 * @param pubKey - The new public key to set.
 */
export async function updateVoterGroupPubKey(
  voterGroupId: Selectable<DBVoterGroup>['id'],
  pubKey: string,
): Promise<void> {
  await db
    .updateTable('voterGroup')
    .set({ pubKey: pubKey })
    .where('id', '=', voterGroupId)
    .executeTakeFirstOrThrow();
}

export async function getVoterGroupPubKey(
  voterGroupId: Selectable<DBVoterGroup>['id'],
): Promise<DBVoterGroup['pubKey']> {
  const result = await db
    .selectFrom('voterGroup')
    .select('pubKey')
    .where('id', '=', voterGroupId)
    .executeTakeFirstOrThrow();

  return result.pubKey;
}
