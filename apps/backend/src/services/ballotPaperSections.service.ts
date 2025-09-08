import { db } from '@repo/db';
import type {
  BallotPaper as DBBallotPaper,
  BallotPaperSection as DBBallotPaperSection,
  Candidate as DBCandidate,
} from '@repo/db/types';
import type {
  InsertableBallotPaperSection,
  SelectableBallotPaperSection,
  UpdateableBallotPaperSection,
} from '@repo/votura-validators';
import type { DeleteResult, Selectable } from 'kysely';
import { spreadableOptional } from '../utils.js';

const ballotPaperSectionTransformer = async (
  ballotPaperSection: Selectable<DBBallotPaperSection>,
): Promise<SelectableBallotPaperSection> => {
  // get candidateIds related to ballotPaperSection
  const candidateIds = await db
    .selectFrom('ballotPaperSectionCandidate')
    .select('candidateId')
    .where('ballotPaperSectionId', '=', ballotPaperSection.id)
    .execute();

  return {
    id: ballotPaperSection.id,
    modifiedAt: ballotPaperSection.modifiedAt.toISOString(),
    createdAt: ballotPaperSection.createdAt.toISOString(),
    name: ballotPaperSection.name,
    ...spreadableOptional(ballotPaperSection, 'description'),
    maxVotes: ballotPaperSection.maxVotes,
    maxVotesPerCandidate: ballotPaperSection.maxVotesPerCandidate,
    candidateIds: candidateIds.map((candidate) => candidate.candidateId),
    ballotPaperId: ballotPaperSection.ballotPaperId,
  };
};

export const createBallotPaperSection = async (
  insertableBallotPaperSection: InsertableBallotPaperSection,
  ballotPaperId: Selectable<DBBallotPaper>['id'],
): Promise<SelectableBallotPaperSection> => {
  const ballotPaperSection = await db
    .insertInto('ballotPaperSection')
    .values({ ...insertableBallotPaperSection, ballotPaperId: ballotPaperId })
    .returningAll()
    .executeTakeFirstOrThrow();

  return ballotPaperSectionTransformer(ballotPaperSection);
};

export const getBallotPaperSections = async (
  ballotPaperId: Selectable<DBBallotPaper>['id'],
): Promise<SelectableBallotPaperSection[]> => {
  const ballotPaperSections = await db
    .selectFrom('ballotPaperSection')
    .selectAll()
    .where('ballotPaperId', '=', ballotPaperId)
    .execute();

  return Promise.all(
    ballotPaperSections.map(async (ballotPaperSection) =>
      ballotPaperSectionTransformer(ballotPaperSection),
    ),
  );
};

export const updateBallotPaperSection = async (
  updateableBallotPaperSection: UpdateableBallotPaperSection,
  ballotPaperSectionId: Selectable<DBBallotPaperSection>['id'],
): Promise<SelectableBallotPaperSection> => {
  const ballotPaperSection = await db
    .updateTable('ballotPaperSection')
    .set({ ...updateableBallotPaperSection })
    .where('id', '=', ballotPaperSectionId)
    .returningAll()
    .executeTakeFirstOrThrow();

  return ballotPaperSectionTransformer(ballotPaperSection);
};

export const getBallotPaperSection = async (
  ballotPaperSectionId: Selectable<DBBallotPaperSection>['id'],
): Promise<SelectableBallotPaperSection> => {
  const ballotPaperSection = await db
    .selectFrom('ballotPaperSection')
    .selectAll()
    .where('id', '=', ballotPaperSectionId)
    .executeTakeFirstOrThrow();

  return ballotPaperSectionTransformer(ballotPaperSection);
};

export const deleteBallotPaperSection = async (
  ballotPaperSectionId: Selectable<DBBallotPaperSection>['id'],
): Promise<DeleteResult> => {
  return db
    .deleteFrom('ballotPaperSection')
    .where('id', '=', ballotPaperSectionId)
    .executeTakeFirst();
};

export const addCandidateToBallotPaperSection = async (
  ballotPaperSectionId: Selectable<DBBallotPaperSection>['id'],
  candidateId: Selectable<DBCandidate>['id'],
): Promise<SelectableBallotPaperSection> => {
  await db
    .insertInto('ballotPaperSectionCandidate')
    .values({ ballotPaperSectionId, candidateId })
    .returningAll()
    .executeTakeFirstOrThrow();

  // get updated ballot paper section
  return getBallotPaperSection(ballotPaperSectionId);
};

export const removeCandidateFromBallotPaperSection = async (
  ballotPaperSectionId: Selectable<DBBallotPaperSection>['id'],
  candidateId: Selectable<DBCandidate>['id'],
): Promise<SelectableBallotPaperSection> => {
  await db
    .deleteFrom('ballotPaperSectionCandidate')
    .where('ballotPaperSectionId', '=', ballotPaperSectionId)
    .where('candidateId', '=', candidateId)
    .executeTakeFirstOrThrow();

  // get updated ballot paper section
  return getBallotPaperSection(ballotPaperSectionId);
};

/**
 * Get the maximum votes (maxVotes and maxVotesPerCandidate) for the sections of a ballot paper.
 * Only the maximum of all sections is returned.
 *
 * @param ballotPaperId The id of the ballot paper to get maxVotes and maxVotesPerCandidate of its related sections from.
 * @return A promise that resolves to an object containing the maximum votes and maximum votes per candidate or 0 if no sections are found.
 */
export const getBPSMaxVotesForBP = async (
  ballotPaperId: Selectable<DBBallotPaper>['id'],
): Promise<{
  maxVotes: DBBallotPaperSection['maxVotes'];
  maxVotesPerCandidate: DBBallotPaperSection['maxVotesPerCandidate'];
}> => {
  const ballotPaperSections = await db
    .selectFrom('ballotPaperSection')
    .select(['maxVotes', 'maxVotesPerCandidate'])
    .where('ballotPaperId', '=', ballotPaperId)
    .execute();

  return {
    maxVotes: Math.max(...ballotPaperSections.map((section) => section.maxVotes), 0),
    maxVotesPerCandidate: Math.max(
      ...ballotPaperSections.map((section) => section.maxVotesPerCandidate),
      0,
    ),
  };
};

export const checkBallotPaperSectionExists = async (
  ballotPaperSectionId: Selectable<DBBallotPaperSection>['id'],
): Promise<boolean> => {
  const result = await db
    .selectFrom('ballotPaperSection')
    .select(['id'])
    .where('id', '=', ballotPaperSectionId)
    .executeTakeFirst();

  return result !== undefined;
};

export const isBallotPaperParentOfBallotPaperSection = async (
  ballotPaperId: Selectable<DBBallotPaper>['id'],
  ballotPaperSectionId: Selectable<DBBallotPaperSection>['id'],
): Promise<boolean> => {
  const result = await db
    .selectFrom('ballotPaperSection')
    .select(['ballotPaperId'])
    .where('id', '=', ballotPaperSectionId)
    .where('ballotPaperId', '=', ballotPaperId)
    .executeTakeFirst();

  return result !== undefined;
};
