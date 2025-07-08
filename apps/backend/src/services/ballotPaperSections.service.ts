import type {
  BallotPaper,
  InsertableBallotPaperSection,
  SelectableBallotPaperSection,
} from '@repo/votura-validators';
import type { Selectable } from 'kysely';
import { db } from '../db/database.js';
import type { BallotPaperSection as KyselyBallotPaperSection } from '../db/types/db.js';
import { spreadableOptional } from '../utils.js';

const ballotPaperSectionTransformer = (
  ballotPaperSection: Selectable<KyselyBallotPaperSection>,
): SelectableBallotPaperSection => {
  return {
    id: ballotPaperSection.id,
    modifiedAt: ballotPaperSection.modifiedAt.toISOString(),
    createdAt: ballotPaperSection.createdAt.toISOString(),
    name: ballotPaperSection.name,
    ...spreadableOptional(ballotPaperSection, 'description'),
    maxVotes: ballotPaperSection.maxVotes,
    maxVotesPerCandidate: ballotPaperSection.maxVotesPerCandidate,
    candidateIds: [], // TODO: implement return candidateIds (see #220)
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

  return ballotPaperSections.map((ballotPaperSection) =>
    ballotPaperSectionTransformer(ballotPaperSection),
  );
};
