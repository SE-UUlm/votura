import { db } from '@repo/db';
import type { BallotPaper as DBBallotPaper, Voter as DBVoter } from '@repo/db/types';
import type { EncryptedFilledBallotPaper } from '@repo/votura-validators';
import type { Selectable } from 'kysely';

const BIGINT_STRING_DELIMITER = '__BIGINT__';

/**
 * Custom replacer function for JSON.stringify to handle BigInt values.
 * @param key The key of the property being stringified.
 * @param value The value of the property being stringified.
 * @returns The processed value.
 */
const replacer: (this: unknown, key: string, value: unknown) => unknown = (key, value) => {
  if (typeof value === 'bigint') {
    return `${BIGINT_STRING_DELIMITER}${value.toString()}${BIGINT_STRING_DELIMITER}`;
  }
  return value;
};

/**
 * Custom reviver function for JSON.parse to handle BigInt values.
 * @param key The key of the property being parsed.
 * @param value The value of the property being parsed.
 * @returns The processed value.
 */
// TODO: remove the next line when the reviver is used
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const reviver: (this: unknown, key: string, value: unknown) => unknown = (key, value) => {
  if (
    typeof value === 'string' &&
    value.startsWith(BIGINT_STRING_DELIMITER) &&
    value.endsWith(BIGINT_STRING_DELIMITER)
  ) {
    const bigIntString = value.slice(
      BIGINT_STRING_DELIMITER.length,
      -BIGINT_STRING_DELIMITER.length,
    );
    return BigInt(bigIntString);
  }
  return value;
};

/**
 * Persists a filled ballot paper for a given voter.
 * Depending on whether the election is private or not, the voterId is included in the vote or not.
 * Also marks the voter as having voted in the voter register.
 * Expects that the filled ballot paper has been validated and the voter is allowed to vote on the ballot paper.
 * @param voterId The ID of the voter casting the vote
 * @param encryptedFilledBallotPaper The encrypted filled ballot paper to persist
 */
export async function persistVote(
  voterId: Selectable<DBVoter>['id'],
  encryptedFilledBallotPaper: EncryptedFilledBallotPaper,
): Promise<void> {
  const ballotPaperId: Selectable<DBBallotPaper>['id'] = encryptedFilledBallotPaper.ballotPaperId;

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
        encryptedFilledBallotPaper: JSON.stringify(encryptedFilledBallotPaper, replacer),
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
