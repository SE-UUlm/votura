import type { BallotPaper, Election } from '@repo/votura-validators';
import { db } from '../../db/database.js';

export async function exitsBallotPaper(ballotPaperId: BallotPaper['id']): Promise<boolean> {
  const result = await db
    .selectFrom('BallotPaper')
    .select(['id'])
    .where('id', '=', ballotPaperId)
    .executeTakeFirst();

  if (result === undefined) {
    return false;
  }
  return true;
}

export async function isElectionParent(
  ballotPaperId: BallotPaper['id'],
  electionId: Election['id'],
): Promise<boolean> {
  const result = await db
    .selectFrom('BallotPaper')
    .select(['id', 'electionId'])
    .where('id', '=', ballotPaperId)
    .where('electionId', '=', electionId)
    .executeTakeFirst();
  if (result === undefined) {
    return false;
  }
  return true;
}
