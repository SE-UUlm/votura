import { db } from '@repo/db';
import type {
  BallotPaper as DBBallotPaper,
  User as DBUser,
  Voter as DBVoter,
  VoterGroup as DBVoterGroup,
} from '@repo/db/types';
import type { InsertableVoterGroup, SelectableVoterGroup } from '@repo/votura-validators';
import type { Selectable } from 'kysely';
import { spreadableOptional } from '../utils.js';

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
  const voterGroup = await db
    .insertInto('voterGroup')
    .values({
      name: insertableVoterGroup.name,
      description: insertableVoterGroup.description,
      voterGroupCreatorId: userId,
    })
    .returningAll()
    .executeTakeFirstOrThrow();

  const voterIds = await createVoters(voterGroup.id, insertableVoterGroup.numberOfVoters);

  if (insertableVoterGroup.ballotPapers.length !== 0) {
    await linkVotersToBallotPapers(voterIds, insertableVoterGroup.ballotPapers);
  }

  return voterGroupTransformer(voterGroup);
}

export async function createVoters(
  voterGroupId: Selectable<DBVoterGroup>['id'],
  numberOfVoters: number,
): Promise<string[]> {
  // insert the voters into the database
  const voterEntries = [];

  for (let i = 0; i < numberOfVoters; i++) {
    voterEntries.push({
      voterGroupId: voterGroupId,
    });
  }

  const voters = await db.insertInto('voter').values(voterEntries).returning('id').execute();

  // check if the number of created voters matches the expected number
  if (voters.length !== numberOfVoters) {
    throw new Error(`Expected to create ${numberOfVoters} voters, but created ${voters.length}`);
  }

  return voters.map((voter) => voter.id);
}

export async function linkVotersToBallotPapers(
  voterIds: Selectable<DBVoter>['id'][],
  ballotPaperIds: Selectable<DBBallotPaper>['id'][],
): Promise<void> {
  const voterRegisterEntries = [];

  for (const voterId of voterIds) {
    for (const ballotPaperId of ballotPaperIds) {
      voterRegisterEntries.push({
        voterId: voterId,
        ballotPaperId: ballotPaperId,
      });
    }
  }

  const voterRegisterResult = await db
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

  return Number(result.count); // For some reason, Kysely returns a string here
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
