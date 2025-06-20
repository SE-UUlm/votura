import type {
  Election,
  InsertableBallotPaper,
  SelectableBallotPaper,
} from '@repo/votura-validators';
import { db } from '../db/database.js';
import { spreadableOptional } from '../utils.js';

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
