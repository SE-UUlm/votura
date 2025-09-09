import { db } from '@repo/db';
import type { BallotPaper as DBBallotPaper, Voter as DBVoter } from '@repo/db/types';
import type { FilledBallotPaper } from '@repo/votura-validators';
import type { Selectable } from 'kysely';

/**
 * Persists a filled ballot paper for a given voter.
 * Depending on whether the election is private or not, the voterId is included in the vote or not.
 * Also marks the voter as having voted in the voter register.
 * Expects that the filled ballot paper has been validated and the voter is allowed to vote on the ballot paper.
 * @param voterId The ID of the voter casting the vote
 * @param filledBallotPaper The filled ballot paper to persist
 */
export async function persistVote(
  voterId: Selectable<DBVoter>['id'],
  filledBallotPaper: FilledBallotPaper,
): Promise<void> {
  const ballotPaperId: Selectable<DBBallotPaper>['id'] = filledBallotPaper.ballotPaperId;

  // find out if election is private or not
  const election = await db
    .selectFrom('election')
    .innerJoin('ballotPaper', 'election.id', 'ballotPaper.electionId')
    .select(['election.private', 'election.id'])
    .where('ballotPaper.id', '=', ballotPaperId)
    .executeTakeFirstOrThrow();

  // store vote and set voter as voted in a transaction to prevent inconsistencies
  await db.transaction().execute(async (trx) => {
    // Insert vote, include voterId only if election is public
    await trx
      .insertInto('vote')
      .values({
        filledBallotPaper: filledBallotPaper,
        electionId: election.id,
        voterId: voterId ?? (election.private ? null : voterId),
      })
      .executeTakeFirstOrThrow();

    // set voter as voted
    await trx
      .updateTable('voterRegister')
      .set({ voted: true })
      .where('voterId', '=', voterId)
      .where('ballotPaperId', '=', ballotPaperId)
      .executeTakeFirstOrThrow();
  });

  return;
}
