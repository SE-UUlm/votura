import { db } from '@repo/db';
import type { BallotPaper as KyselyBallotPaper } from '@repo/db/types';
import type {
  BallotPaper,
  Election,
  InsertableBallotPaper,
  SelectableBallotPaper,
  UpdateableBallotPaper,
} from '@repo/votura-validators';
import type { DeleteResult, Selectable } from 'kysely';
import { spreadableOptional } from '../utils.js';
import { checkElectionsNotFrozen, getDBElections } from './elections.service.js';

const ballotPaperTransformer = (
  ballotPaper: Selectable<KyselyBallotPaper>,
): SelectableBallotPaper => {
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
  ballotPaperId: BallotPaper['id'],
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
  ballotPaperId: BallotPaper['id'],
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
  ballotPaperId: BallotPaper['id'],
): Promise<DeleteResult> => {
  return db.deleteFrom('ballotPaper').where('id', '=', ballotPaperId).executeTakeFirst();
};

export const checkBallotPapersExist = async (
  ballotPaperIds: BallotPaper['id'][],
): Promise<boolean> => {
  const ballotPapers = await db
    .selectFrom('ballotPaper')
    .select('id')
    .where('id', 'in', ballotPaperIds)
    .execute();

  return ballotPapers.length === ballotPaperIds.length;
};

export const checkBallotPapersBelongToUser = async (
  ballotPaperIds: BallotPaper['id'][],
  userId: string,
): Promise<boolean> => {
  const elections = await getDBElections(userId);
  const electionIds = elections.map((election) => election.id);

  const ballotPapers = await db
    .selectFrom('ballotPaper')
    .select('id')
    .where('id', 'in', ballotPaperIds)
    .where('electionId', 'in', electionIds)
    .execute();

  return ballotPapers.length === ballotPaperIds.length;
};

export const checkBallotPapersFromDifferentElections = async (
  ballotPaperIds: BallotPaper['id'][],
): Promise<boolean> => {
  const ballotPapers = await db
    .selectFrom('ballotPaper')
    .select('electionId')
    .where('id', 'in', ballotPaperIds)
    .execute();

  const uniqueElectionIds = new Set(ballotPapers.map((bp) => bp.electionId));
  return uniqueElectionIds.size === ballotPapers.length;
};

export const checkBallotPapersElectionNotFrozen = async (
  ballotPaperIds: BallotPaper['id'][],
): Promise<boolean> => {
  const ballotPapers = await db
    .selectFrom('ballotPaper')
    .select('electionId')
    .where('id', 'in', ballotPaperIds)
    .execute();

  const electionIds = ballotPapers.map((bp) => bp.electionId);
  return checkElectionsNotFrozen(electionIds);
};
