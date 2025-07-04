import type {
  Candidate,
  Election,
  InsertableCandidate,
  SelectableCandidate,
  UpdateableCandidate,
} from '@repo/votura-validators';
import type { Selectable } from 'kysely';
import { db } from '../db/database.js';
import type { Candidate as KyselyCandidate } from '../db/types/db.js';
import { spreadableOptional } from '../utils.js';

const candidateTransformer = (candidate: Selectable<KyselyCandidate>): SelectableCandidate => {
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
  electionId: Election['id'],
): Promise<SelectableCandidate | null> => {
  const candidate = await db
    .insertInto('Candidate')
    .values({
      ...insertableCandidate,
      electionId: electionId,
    })
    .returningAll()
    .executeTakeFirst();

  if (candidate === undefined) {
    return null;
  }

  return candidateTransformer(candidate);
};

export const getCandidates = async (electionId: Election['id']): Promise<SelectableCandidate[]> => {
  const candidates = await db
    .selectFrom('Candidate')
    .selectAll()
    .where('electionId', '=', electionId)
    .execute();

  return candidates.map((candidate) => candidateTransformer(candidate));
};

export const getCandidate = async (
  candidateId: Candidate['id'],
): Promise<SelectableCandidate | null> => {
  const candidate = await db
    .selectFrom('Candidate')
    .selectAll()
    .where('id', '=', candidateId)
    .executeTakeFirst();

  if (candidate === undefined) {
    return null;
  }

  return candidateTransformer(candidate);
};

export const updateCandidate = async (
  updateableCandidate: UpdateableCandidate,
  candidateId: Candidate['id'],
): Promise<SelectableCandidate | null> => {
  const candidate = await db
    .updateTable('Candidate')
    .set({ ...updateableCandidate })
    .where('id', '=', candidateId)
    .returningAll()
    .executeTakeFirst();

  if (candidate === undefined) {
    return null;
  }

  return candidateTransformer(candidate);
};
