import { db } from '@repo/db';
import type { BallotPaper as DBBallotPaper, User as DBUser } from '@repo/db/types';
import type {
  Election,
  InsertableBallotPaper,
  SelectableBallotPaper,
  UpdateableBallotPaper,
} from '@repo/votura-validators';
import type { DeleteResult, Selectable } from 'kysely';
import { spreadableOptional } from '../utils.js';

const ballotPaperTransformer = (ballotPaper: Selectable<DBBallotPaper>): SelectableBallotPaper => {
  return {
    id: ballotPaper.id,
    modifiedAt: ballotPaper.modifiedAt.toISOString(),
    createdAt: ballotPaper.createdAt.toISOString(),
    name: ballotPaper.name,
    ...spreadableOptional(ballotPaper, 'description'),
    maxVotes: ballotPaper.maxVotes,
    maxVotesPerCandidate: ballotPaper.maxVotesPerCandidate,
    electionId: ballotPaper.electionId,
  };
};

export const createBallotPaper = async (
  insertableBallotPaper: InsertableBallotPaper,
  electionId: Election['id'],
): Promise<SelectableBallotPaper> => {
  const ballotPaper = await db
    .insertInto('ballotPaper')
    .values({ ...insertableBallotPaper, electionId: electionId })
    .returningAll()
    .executeTakeFirstOrThrow();

  return ballotPaperTransformer(ballotPaper);
};

export const getBallotPapers = async (
  electionId: Election['id'],
): Promise<SelectableBallotPaper[]> => {
  const ballotPapers = await db
    .selectFrom('ballotPaper')
    .selectAll()
    .where('electionId', '=', electionId)
    .execute();

  return ballotPapers.map((ballotPaper) => ballotPaperTransformer(ballotPaper));
};

export const getBallotPaper = async (
  ballotPaperId: Selectable<DBBallotPaper>['id'],
): Promise<SelectableBallotPaper> => {
  const ballotPaper = await db
    .selectFrom('ballotPaper')
    .selectAll()
    .where('id', '=', ballotPaperId)
    .executeTakeFirstOrThrow();

  return ballotPaperTransformer(ballotPaper);
};

export const updateBallotPaper = async (
  updateableBallotPaper: UpdateableBallotPaper,
  ballotPaperId: Selectable<DBBallotPaper>['id'],
): Promise<SelectableBallotPaper> => {
  const ballotPaper = await db
    .updateTable('ballotPaper')
    .set({ ...updateableBallotPaper })
    .where('id', '=', ballotPaperId)
    .returningAll()
    .executeTakeFirstOrThrow();

  return ballotPaperTransformer(ballotPaper);
};

export const deleteBallotPaper = async (
  ballotPaperId: Selectable<DBBallotPaper>['id'],
): Promise<DeleteResult> => {
  return db.deleteFrom('ballotPaper').where('id', '=', ballotPaperId).executeTakeFirst();
};

export const checkBallotPapersExist = async (
  ballotPaperIds: Selectable<DBBallotPaper>['id'][],
): Promise<boolean> => {
  if (ballotPaperIds.length === 0) {
    return true; // No ballot papers to check, so they "exist"
  }

  const ballotPapers = await db
    .selectFrom('ballotPaper')
    .select('id')
    .where('id', 'in', ballotPaperIds)
    .execute();

  return ballotPapers.length === ballotPaperIds.length;
};

export const checkBallotPapersBelongToUser = async (
  ballotPaperIds: Selectable<DBBallotPaper>['id'][],
  userId: Selectable<DBUser>['id'],
): Promise<boolean> => {
  if (ballotPaperIds.length === 0) {
    return true; // No ballot papers to check, so they "belong" to the user
  }

  // Check if any ballot paper does not belong to the user's elections
  // terminate early if we find one
  const unauthorizedBallotPaper = await db
    .selectFrom('ballotPaper')
    .leftJoin('election', (join) =>
      join
        .onRef('ballotPaper.electionId', '=', 'election.id')
        .on('election.electionCreatorId', '=', userId),
    )
    .select('ballotPaper.id')
    .where('ballotPaper.id', 'in', ballotPaperIds)
    .where('election.id', 'is', null) // ballot paper doesn't belong to user's election
    .limit(1)
    .executeTakeFirst();

  return unauthorizedBallotPaper === undefined;
};

export const checkBallotPapersFromDifferentElections = async (
  ballotPaperIds: Selectable<DBBallotPaper>['id'][],
): Promise<boolean> => {
  if (ballotPaperIds.length === 0) {
    return true; // No ballot papers to check, so they "belong" to the same election
  }

  const ballotPapers = await db
    .selectFrom('ballotPaper')
    .select('electionId')
    .where('id', 'in', ballotPaperIds)
    .distinct()
    .execute();

  return ballotPaperIds.length === ballotPapers.length;
};

export const checkBallotPapersElectionNotFrozen = async (
  ballotPaperIds: Selectable<DBBallotPaper>['id'][],
): Promise<boolean> => {
  if (ballotPaperIds.length === 0) {
    return true; // No ballot papers to check, so they are considered not frozen
  }

  const frozenElectionExists = await db
    .selectFrom('ballotPaper')
    .innerJoin('election', 'election.id', 'ballotPaper.electionId')
    .where('ballotPaper.id', 'in', ballotPaperIds)
    .where('election.configFrozen', '=', true)
    .select('ballotPaper.id')
    .limit(1) // We only need to find one frozen election to know the condition is false
    .executeTakeFirst();

  return frozenElectionExists === undefined;
};
