import { db } from '@repo/db';
import type {
  BallotPaper as DBBallotPaper,
  Election as DBElection,
  User as DBUser,
} from '@repo/db/types';
import type {
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
  electionId: Selectable<DBElection>['id'],
): Promise<SelectableBallotPaper> => {
  const ballotPaper = await db
    .insertInto('ballotPaper')
    .values({ ...insertableBallotPaper, electionId: electionId })
    .returningAll()
    .executeTakeFirstOrThrow();

  return ballotPaperTransformer(ballotPaper);
};

export const getBallotPapers = async (
  electionId: Selectable<DBElection>['id'],
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

/**
 * Get the maxVotes and maxVotesPerCandidate for the ballot paper with the given ballotPaperId
 *
 * @param ballotPaperId The id of the ballot paper to get maxVotes and maxVotesPerCandidate from
 * @returns A promise that resolves to the maxVotes and maxVotesPerCandidate values if successful, or null if unsuccessful
 */
export const getBallotPaperMaxVotes = async (
  ballotPaperId: Selectable<DBBallotPaper>['id'],
): Promise<{
  maxVotes: DBBallotPaper['maxVotes'];
  maxVotesPerCandidate: DBBallotPaper['maxVotesPerCandidate'];
}> => {
  const ballotPaper = await db
    .selectFrom('ballotPaper')
    .select(['maxVotes', 'maxVotesPerCandidate'])
    .where('id', '=', ballotPaperId)
    .executeTakeFirstOrThrow();

  return { maxVotes: ballotPaper.maxVotes, maxVotesPerCandidate: ballotPaper.maxVotesPerCandidate };
};

export const getBallotPaperSectionCount = async (
  ballotPaperId: Selectable<DBBallotPaper>['id'],
): Promise<number> => {
  const result = await db
    .selectFrom('ballotPaperSection')
    .where('ballotPaperId', '=', ballotPaperId)
    .select(db.fn.count<number>('id').as('count'))
    .executeTakeFirstOrThrow();

  return result.count;
};

export const getBallotPaperEncryptionKeys = async (
  ballotPaperId: Selectable<DBBallotPaper>['id'],
): Promise<{
  pubKey: string;
  privKey: string;
  primeP: string;
  primeQ: string;
  generator: string;
}> => {
  const result = await db
    .selectFrom('ballotPaper')
    .innerJoin('election', 'ballotPaper.electionId', 'election.id')
    .where('ballotPaper.id', '=', ballotPaperId)
    .where('election.configFrozen', '=', true)
    .where('election.pubKey', 'is not', null)
    .where('election.privKey', 'is not', null)
    .where('election.primeP', 'is not', null)
    .where('election.primeQ', 'is not', null)
    .where('election.generator', 'is not', null)
    .select([
      'election.pubKey',
      'election.privKey',
      'election.primeP',
      'election.primeQ',
      'election.generator',
    ])
    .executeTakeFirstOrThrow();

  // 'as' assertions are safe here due to the 'is not null' checks above
  return result as {
    pubKey: string;
    privKey: string;
    primeP: string;
    primeQ: string;
    generator: string;
  };
};

/**
 * Checks if the given ballot papers exist in the database.
 * The ballot paper IDs need to be unique, otherwise the check will fail.
 *
 * @param ballotPaperIds Array of unique IDs of the ballot papers to check.
 * @returns True if all ballot papers exist, false otherwise.
 */
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

/**
 * Checks if the given ballot papers belong to different elections.
 * The ballot paper IDs need to be unique, otherwise the check will fail.
 *
 * @param ballotPaperIds Array of unique IDs of the ballot papers to check.
 * @returns True if all ballot papers belong to different elections, false otherwise.
 */
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

export const isElectionParentOfBallotPaper = async (
  electionId: Selectable<DBElection>['id'],
  ballotPaperId: Selectable<DBBallotPaper>['id'],
): Promise<boolean> => {
  const result = await db
    .selectFrom('ballotPaper')
    .select(['electionId'])
    .where('id', '=', ballotPaperId)
    .where('electionId', '=', electionId)
    .executeTakeFirst();

  return result !== undefined;
};

/**
 * Checks if the election the ballot paper belongs to is votable (start date reached, end date not reached and frozen).
 * @param ballotPaperId The id of the ballot paper to check.
 * @returns A promise that resolves to true if the ballot paper is votable, false otherwise.
 */
export const checkBallotPaperIsVotable = async (
  ballotPaperId: Selectable<DBBallotPaper>['id'],
): Promise<boolean> => {
  const result = await db
    .selectFrom('ballotPaper')
    .innerJoin('election', 'ballotPaper.electionId', 'election.id')
    .select('election.id')
    .where('ballotPaper.id', '=', ballotPaperId)
    .where('election.votingStartAt', '<=', new Date())
    .where('election.votingEndAt', '>=', new Date())
    .where('election.configFrozen', '=', true)
    .executeTakeFirst();

  return result !== undefined;
};
