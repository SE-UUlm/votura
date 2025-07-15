import { db } from '@repo/db';
import type { BallotPaperSection as KyselyBallotPaperSection } from '@repo/db/types';
import type {
  BallotPaper,
  BallotPaperSection,
  Candidate,
  InsertableBallotPaperSection,
  SelectableBallotPaperSection,
  UpdateableBallotPaperSection,
} from '@repo/votura-validators';
import type { DeleteResult, Selectable } from 'kysely';
import { spreadableOptional } from '../utils.js';

const ballotPaperSectionTransformer = async (
  ballotPaperSection: Selectable<KyselyBallotPaperSection>,
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
  ballotPaperId: BallotPaper['id'],
): Promise<SelectableBallotPaperSection | null> => {
  const ballotPaperSection = await db
    .insertInto('ballotPaperSection')
    .values({ ...insertableBallotPaperSection, ballotPaperId: ballotPaperId })
    .returningAll()
    .executeTakeFirst();

  if (ballotPaperSection === undefined) {
    return null;
  }

  return ballotPaperSectionTransformer(ballotPaperSection);
};

export const getBallotPaperSections = async (
  ballotPaperId: BallotPaper['id'],
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
  ballotPaperSectionId: BallotPaperSection['id'],
): Promise<SelectableBallotPaperSection | null> => {
  const ballotPaperSection = await db
    .updateTable('ballotPaperSection')
    .set({ ...updateableBallotPaperSection })
    .where('id', '=', ballotPaperSectionId)
    .returningAll()
    .executeTakeFirst();

  if (ballotPaperSection === undefined) {
    return null;
  }

  return ballotPaperSectionTransformer(ballotPaperSection);
};

export const getBallotPaperSection = async (
  ballotPaperSectionId: BallotPaperSection['id'],
): Promise<SelectableBallotPaperSection | null> => {
  const ballotPaperSection = await db
    .selectFrom('ballotPaperSection')
    .selectAll()
    .where('id', '=', ballotPaperSectionId)
    .executeTakeFirst();

  if (ballotPaperSection === undefined) {
    return null;
  }

  return ballotPaperSectionTransformer(ballotPaperSection);
};

export const deleteBallotPaperSection = async (
  ballotPaperSectionId: BallotPaperSection['id'],
): Promise<DeleteResult> => {
  return db
    .deleteFrom('ballotPaperSection')
    .where('id', '=', ballotPaperSectionId)
    .executeTakeFirst();
};

export enum AddCandidateToBallotPaperSectionError {
  candidateNotFound = 'candidateNotFound',
  ballotPaperSectionNotFound = 'ballotPaperSectionNotFound',
}

export const addCandidateToBallotPaperSection = async (
  ballotPaperSectionId: BallotPaperSection['id'],
  candidateId: Candidate['id'],
): Promise<SelectableBallotPaperSection | AddCandidateToBallotPaperSectionError> => {
  // make sure candidate exists
  const candidate = await db
    .selectFrom('candidate')
    .selectAll()
    .where('id', '=', candidateId)
    .executeTakeFirst();

  if (candidate === undefined) {
    return AddCandidateToBallotPaperSectionError.candidateNotFound;
  }

  // add candidate to ballot paper section
  await db
    .insertInto('ballotPaperSectionCandidate')
    .values({ ballotPaperSectionId, candidateId })
    .returningAll()
    .executeTakeFirstOrThrow();

  // get updated ballot paper section
  const ballotPaperSection = await getBallotPaperSection(ballotPaperSectionId);
  if (ballotPaperSection === null) {
    return AddCandidateToBallotPaperSectionError.ballotPaperSectionNotFound;
  }

  return ballotPaperSection;
};

export enum RemoveCandidateFromBallotPaperSectionError {
  candidateNotFound = 'candidateNotFound',
  ballotPaperSectionNotFound = 'ballotPaperSectionNotFound',
  candidateNotLinkedToBallotPaperSection = 'candidateNotLinkedToBallotPaperSection',
}

export const removeCandidateFromBallotPaperSection = async (
  ballotPaperSectionId: BallotPaperSection['id'],
  candidateId: Candidate['id'],
): Promise<SelectableBallotPaperSection | RemoveCandidateFromBallotPaperSectionError> => {
  // make sure candidate exists
  const candidate = await db
    .selectFrom('candidate')
    .selectAll()
    .where('id', '=', candidateId)
    .executeTakeFirst();

  if (candidate === undefined) {
    return RemoveCandidateFromBallotPaperSectionError.candidateNotFound;
  }

  // remove candidate from ballot paper section
  const result = await db
    .deleteFrom('ballotPaperSectionCandidate')
    .where('ballotPaperSectionId', '=', ballotPaperSectionId)
    .where('candidateId', '=', candidateId)
    .executeTakeFirst();

  if (result.numDeletedRows < 1n) {
    return RemoveCandidateFromBallotPaperSectionError.candidateNotLinkedToBallotPaperSection;
  }

  // get updated ballot paper section
  const ballotPaperSection = await getBallotPaperSection(ballotPaperSectionId);
  if (ballotPaperSection === null) {
    return RemoveCandidateFromBallotPaperSectionError.ballotPaperSectionNotFound;
  }

  return ballotPaperSection;
};
