import { db } from '@repo/db';
import type { Voter as KyselyVoter, VoterGroup as KyselyVoterGroup } from '@repo/db/types';
import type { InsertableVoterGroup, SelectableVoterGroup } from '@repo/votura-validators';
import type { Selectable } from 'kysely';
import { spreadableOptional } from '../utils.js';

async function voterGroupTransformer(
  voterGroup: Selectable<KyselyVoterGroup>,
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
  userId: string,
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
  voterGroupId: string,
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
  voterIds: string[],
  ballotPaperIds: string[],
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

export async function getVotersInVoterGroup(
  voterGroupId: string,
): Promise<Selectable<KyselyVoter>[]> {
  return db.selectFrom('voter').where('voterGroupId', '=', voterGroupId).selectAll().execute();
}

export async function getNumberOfVotersInGroup(voterGroupId: string): Promise<number> {
  const voters = await getVotersInVoterGroup(voterGroupId);

  return voters.length;
}

export async function getBallotPaperIdsForVoterGroup(voterGroupId: string): Promise<string[]> {
  const voters = await getVotersInVoterGroup(voterGroupId);
  const voterIds = voters.map((voter) => voter.id);

  const voterRegisters = await db
    .selectFrom('voterRegister')
    .where('voterId', 'in', voterIds)
    .select('ballotPaperId')
    .execute();
  const ballotPaperIds = voterRegisters.map((voterRegister) => voterRegister.ballotPaperId);

  return [...new Set(ballotPaperIds)]; // Return unique ballot paper IDs
}

export async function getVoterGroupsForUser(userId: string): Promise<SelectableVoterGroup[]> {
  const voterGroups = await db
    .selectFrom('voterGroup')
    .where('voterGroupCreatorId', '=', userId)
    .selectAll()
    .execute();

  return Promise.all(voterGroups.map(async (voterGroup) => voterGroupTransformer(voterGroup)));
}
