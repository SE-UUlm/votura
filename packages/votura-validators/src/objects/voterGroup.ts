import { z } from 'zod/v4';
import { toJsonSchemaParams } from '../parserParams.js';
import { voturaMetadataRegistry } from '../voturaMetadateRegistry.js';
import { ballotPaperObject } from './ballotPaper.js';
import { identifiableTimestampedObject } from './identifiableTimestampedObject.js';

export const voterGroupObject = z.object({
  ...identifiableTimestampedObject.shape,
  name: z.string().min(1).max(256).register(voturaMetadataRegistry, {
    description: 'The name of the voter group.',
  }),
  description: z.string().min(1).max(256).optional().register(voturaMetadataRegistry, {
    description: 'The description text of the voter group.',
  }),
  numberOfVoters: z.int32().min(1).register(voturaMetadataRegistry, {
    description: 'Specifies the number of voters that belong to this voter group.',
    example: 42,
  }),
  ballotPapers: z.array(ballotPaperObject.shape.id).min(1).register(voturaMetadataRegistry, {
    description:
      'All ballot papers that are linked to this voter group. A voter which is part of this voter group can vote on these ballot papers.',
  }),
});

export type VoterGroup = z.infer<typeof voterGroupObject>;

export const insertableVoterGroupObject = voterGroupObject.pick({
  name: true,
  description: true,
  numberOfVoters: true,
  ballotPapers: true,
});

export type InsertableVoterGroup = z.infer<typeof insertableVoterGroupObject>;

export const insertableVoterGroupObjectSchema = z.toJSONSchema(
  insertableVoterGroupObject,
  toJsonSchemaParams,
);

export const selectableVoterGroupObject = voterGroupObject.pick({
  id: true,
  modifiedAt: true,
  createdAt: true,
  name: true,
  description: true,
  numberOfVoters: true,
  ballotPapers: true,
});

export type SelectableVoterGroup = z.infer<typeof selectableVoterGroupObject>;

export const selectableVoterGroupObjectSchema = z.toJSONSchema(
  selectableVoterGroupObject,
  toJsonSchemaParams,
);

export const updateableVoterGroupObject = voterGroupObject.pick({
  name: true,
  description: true,
  numberOfVoters: true,
  ballotPapers: true,
});

export type UpdateableVoterGroup = z.infer<typeof updateableVoterGroupObject>;

export const updateableVoterGroupObjectSchema = z.toJSONSchema(
  updateableVoterGroupObject,
  toJsonSchemaParams,
);
