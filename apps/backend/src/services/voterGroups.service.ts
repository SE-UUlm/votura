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
import { spreadableOptional } from '../utils.js';

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
