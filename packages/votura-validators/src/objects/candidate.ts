import { z } from 'zod/v4';
import { IdentifiableTimestampedObject } from './identifiableTimestampedObject.js';
import { voturaMetadataRegistry } from '../voturaMetadateRegistry.js';
import { BallotPaperSectionObject } from './ballotPaperSection.js';
import { ElectionObject } from './election.js';
import { toJsonSchemaParams } from '../parserParams.js';

export const CandidateObject = z.object({
  ...IdentifiableTimestampedObject.shape,
  title: z.string().min(1).max(256).register(voturaMetadataRegistry, {
    description: 'The title / name of the candidate.',
    example: 'Option A',
  }),
  description: z.string().min(1).max(256).optional().register(voturaMetadataRegistry, {
    description: 'The description text of the candidate. Is optional',
    example: 'This is a super important description.',
  }),
  ballotPaperSections: z
    .array(BallotPaperSectionObject.shape.id)
    .min(0)
    .register(voturaMetadataRegistry, {
      description: 'The IDs of the ballot paper section where this candidate appears.',
    }),
  electionId: ElectionObject.shape.id.register(voturaMetadataRegistry, {
    description: 'The ID of the election to which this candidate belongs.',
    example: '4ef40d09-abe9-4c3f-8176-764eb0e5e70d',
  }),
});

export type Candidate = z.infer<typeof CandidateObject>;

export const InsertableCandidateObject = CandidateObject.pick({
  title: true,
  description: true,
  ballotPaperSections: true,
});

export type InsertableCandidate = z.infer<typeof InsertableCandidateObject>;

export const InsertableCandidateObjectSchema = z.toJSONSchema(
  InsertableCandidateObject,
  toJsonSchemaParams,
);

export const SelectableCandidateObject = CandidateObject.pick({
  id: true,
  createdAt: true,
  modifiedAt: true,
  title: true,
  description: true,
  ballotPaperSections: true,
  electionId: true,
});

export type SelectableCandidate = z.infer<typeof SelectableCandidateObject>;

export const SelectableCandidateObjectSchema = z.toJSONSchema(
  SelectableCandidateObject,
  toJsonSchemaParams,
);

export const UpdateableCandidateObject = CandidateObject.pick({
  title: true,
  description: true,
  ballotPaperSections: true,
});

export type UpdateableCandidate = z.infer<typeof UpdateableCandidateObject>;

export const UpdateableCandidateObjectSchema = z.toJSONSchema(
  UpdateableCandidateObject,
  toJsonSchemaParams,
);
