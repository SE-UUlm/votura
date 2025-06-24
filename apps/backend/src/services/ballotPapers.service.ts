import type {
  BallotPaper,
  Election,
  InsertableBallotPaper,
  SelectableBallotPaper,
} from '@repo/votura-validators';
import type { Selectable } from 'kysely';
import { db } from '../db/database.js';
import type { BallotPaper as KyselyBallotPaper } from '../db/types/db.js';
import { spreadableOptional } from '../utils.js';

export const ballotPaperTransformer = (ballotPaper: Selectable<KyselyBallotPaper>): BallotPaper => {
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
): Promise<SelectableBallotPaper | null> => {
  const ballotPaper = await db
    .insertInto('BallotPaper')
    .values({ ...insertableBallotPaper, electionId: electionId })
    .returningAll()
    .executeTakeFirst();

  if (ballotPaper === undefined) {
    return null;
  }

  return ballotPaperTransformer(ballotPaper);
};

export const getBallotPapers = async (
  electionId: Election['id'],
): Promise<SelectableBallotPaper[]> => {
  const ballotPapers = await db
    .selectFrom('BallotPaper')
    .selectAll()
    .where('electionId', '=', electionId)
    .execute();

  return ballotPapers.map((ballotPaper) => ballotPaperTransformer(ballotPaper));
};
