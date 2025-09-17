import { getPepper, hashPassword } from '@repo/hash';
import type { Kysely } from 'kysely';
import type { DB } from './types/db.js';

export const seed = async (db: Kysely<DB>): Promise<void> => {
  const user = await db
    .insertInto('user')
    .values({
      email: 'user@votura.org',
      passwordHash: await hashPassword('HelloVotura1!', getPepper()),
    })
    .returningAll()
    .executeTakeFirstOrThrow();

  const election = await db
    .insertInto('election')
    .values({
      electionCreatorId: user.id,
      name: 'Election 1',
      description: 'This is election one',
      votingStartAt: new Date('2024-07-29T15:51:28.071Z'),
      votingEndAt: new Date('2024-07-30T15:51:28.071Z'),
    })
    .returningAll()
    .executeTakeFirstOrThrow();

  const ballotPaper = await db
    .insertInto('ballotPaper')
    .values({
      name: 'Ballot Paper 1',
      description: 'This is ballot paper one',
      maxVotes: 5,
      maxVotesPerCandidate: 2,
      electionId: election.id,
    })
    .returningAll()
    .executeTakeFirstOrThrow();

  await db
    .insertInto('ballotPaperSection')
    .values({
      name: 'BPS1',
      maxVotes: 5,
      maxVotesPerCandidate: 2,
      ballotPaperId: ballotPaper.id,
    })
    .returningAll()
    .executeTakeFirstOrThrow();

  await db.destroy();
};
