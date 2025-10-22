import { db } from '@repo/db';
import type {
  BallotPaper as DBBallotPaper,
  Candidate as DBCandidate,
  Election as DBElection,
} from '@repo/db/types';
import type {
  InsertableCandidate,
  SelectableCandidate,
  UpdateableCandidate,
} from '@repo/votura-validators';
import type { DeleteResult, Selectable } from 'kysely';
import { spreadableOptional } from '../utils.js';

const candidateTransformer = (candidate: Selectable<DBCandidate>): SelectableCandidate => {
  return {
    id: candidate.id,
    createdAt: candidate.createdAt.toISOString(),
    modifiedAt: candidate.modifiedAt.toISOString(),
    title: candidate.title,
    ...spreadableOptional(candidate, 'description'),
    electionId: candidate.electionId,
  };
};

export const createCandidate = async (
  insertableCandidate: InsertableCandidate,
  electionId: Selectable<DBElection>['id'],
): Promise<SelectableCandidate> => {
  const candidate = await db
    .insertInto('candidate')
    .values({
      ...insertableCandidate,
      electionId: electionId,
    })
    .returningAll()
    .executeTakeFirstOrThrow();

  return candidateTransformer(candidate);
};

export const getCandidates = async (
  electionId: Selectable<DBElection>['id'],
): Promise<SelectableCandidate[]> => {
  const candidates = await db
    .selectFrom('candidate')
    .selectAll()
    .where('electionId', '=', electionId)
    .execute();

  return candidates.map((candidate) => candidateTransformer(candidate));
};

export const getCandidate = async (
  candidateId: Selectable<DBCandidate>['id'],
): Promise<SelectableCandidate> => {
  const candidate = await db
    .selectFrom('candidate')
    .selectAll()
    .where('id', '=', candidateId)
    .executeTakeFirstOrThrow();

  return candidateTransformer(candidate);
};

export const updateCandidate = async (
  updateableCandidate: UpdateableCandidate,
  candidateId: Selectable<DBCandidate>['id'],
): Promise<SelectableCandidate> => {
  const candidate = await db
    .updateTable('candidate')
    .set({ ...updateableCandidate })
    .where('id', '=', candidateId)
    .returningAll()
    .executeTakeFirstOrThrow();

  return candidateTransformer(candidate);
};

export const deleteCandidate = async (
  candidateId: Selectable<DBCandidate>['id'],
): Promise<DeleteResult> => {
  return db.deleteFrom('candidate').where('id', '=', candidateId).executeTakeFirst();
};

/**
 * Checks if a candidate is linked to a specific ballot paper section.
 * @param candidateId The ID of the candidate to check.
 * @param ballotPaperSectionId The ID of the ballot paper section to check.
 * @returns True if the candidate is linked to the ballot paper section, false otherwise.
 */
export const isCandidateLinkedToBallotPaperSection = async (
  candidateId: Selectable<DBCandidate>['id'],
  ballotPaperSectionId: Selectable<DBBallotPaper>['id'],
): Promise<boolean> => {
  const result = await db
    .selectFrom('ballotPaperSectionCandidate')
    .select('id')
    .where('candidateId', '=', candidateId)
    .where('ballotPaperSectionId', '=', ballotPaperSectionId)
    .executeTakeFirst();

  return result !== undefined;
};

export const checkCandidateExists = async (
  candidateId: Selectable<DBCandidate>['id'],
): Promise<boolean> => {
  const candidate = await db
    .selectFrom('candidate')
    .select('id')
    .where('id', '=', candidateId)
    .executeTakeFirst();

  return candidate !== undefined;
};

export const isElectionParentOfCandidate = async (
  electionId: Selectable<DBElection>['id'],
  candidateId: Selectable<DBCandidate>['id'],
): Promise<boolean> => {
  const result = await db
    .selectFrom('candidate')
    .select('electionId')
    .where('id', '=', candidateId)
    .where('electionId', '=', electionId)
    .executeTakeFirst();

  return result !== undefined;
};
