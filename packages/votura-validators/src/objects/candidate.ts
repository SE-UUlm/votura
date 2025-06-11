import { z } from 'zod/v4';
import { identifiableTimestampedObject } from './identifiableTimestampedObject.js';
import { voturaMetadataRegistry } from '../voturaMetadateRegistry.js';
import { ballotPaperSectionObject } from './ballotPaperSection.js';
import { electionObject } from './election.js';
import { toJsonSchemaParams } from '../parserParams.js';

export const candidateObject = z.object({
  ...identifiableTimestampedObject.shape,
  title: z.string().min(1).max(256).register(voturaMetadataRegistry, {
    description: 'The title / name of the candidate.',
    example: 'Option A',
  }),
  description: z.string().min(1).max(256).optional().register(voturaMetadataRegistry, {
    description: 'The description text of the candidate. Is optional',
    example: 'This is a super important description.',
  }),
  ballotPaperSections: z
    .array(ballotPaperSectionObject.shape.id)
    .min(0)
    .register(voturaMetadataRegistry, {
      description: 'The IDs of the ballot paper section where this candidate appears.',
    }),
  electionId: electionObject.shape.id.register(voturaMetadataRegistry, {
    description: 'The ID of the election to which this candidate belongs.',
    example: '4ef40d09-abe9-4c3f-8176-764eb0e5e70d',
  }),
});

export type Candidate = z.infer<typeof candidateObject>;

export const insertableCandidateObject = candidateObject.pick({
  title: true,
  description: true,
  ballotPaperSections: true,
});

export type InsertableCandidate = z.infer<typeof insertableCandidateObject>;

export const insertableCandidateObjectSchema = z.toJSONSchema(
  insertableCandidateObject,
  toJsonSchemaParams,
);

export const selectableCandidateObject = candidateObject.pick({
  id: true,
  createdAt: true,
  modifiedAt: true,
  title: true,
  description: true,
  ballotPaperSections: true,
  electionId: true,
});

export type SelectableCandidate = z.infer<typeof selectableCandidateObject>;

export const selectableCandidateObjectSchema = z.toJSONSchema(
  selectableCandidateObject,
  toJsonSchemaParams,
);

export const updateableCandidateObject = candidateObject.pick({
  title: true,
  description: true,
  ballotPaperSections: true,
});

export type UpdateableCandidate = z.infer<typeof updateableCandidateObject>;

export const updateableCandidateObjectSchema = z.toJSONSchema(
  updateableCandidateObject,
  toJsonSchemaParams,
);
