import { IdentifiableTimestampedObject } from './identifiableTimestampedObject.js';
import { z } from 'zod/v4';
import { voturaMetadataRegistry } from '../voturaMetadateRegistry.js';
import { BallotPaperObject } from './ballotPaper.js';
import { toJsonSchemaParams } from '../parserParams.js';

export const VoterGroupObject = z.object({
  ...IdentifiableTimestampedObject.shape,
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
  ballotPapers: z.array(BallotPaperObject.shape.id).min(1).register(voturaMetadataRegistry, {
    description:
      'All ballot papers that are linked to this voter group. A voter which is part of this voter group can vote on these ballot papers.',
  }),
});

export type VoterGroup = z.infer<typeof VoterGroupObject>;

export const InsertableVoterGroupObject = VoterGroupObject.pick({
  name: true,
  description: true,
  numberOfVoters: true,
  ballotPapers: true,
});

export type InsertableVoterGroup = z.infer<typeof InsertableVoterGroupObject>;

export const InsertableVoterGroupObjectSchema = z.toJSONSchema(
  InsertableVoterGroupObject,
  toJsonSchemaParams,
);

export const SelectableVoterGroupObject = VoterGroupObject.pick({
  id: true,
  modifiedAt: true,
  createdAt: true,
  name: true,
  description: true,
  numberOfVoters: true,
  ballotPapers: true,
});

export type SelectableVoterGroup = z.infer<typeof SelectableVoterGroupObject>;

export const SelectableVoterGroupObjectSchema = z.toJSONSchema(
  SelectableVoterGroupObject,
  toJsonSchemaParams,
);

export const UpdateableVoterGroupObject = VoterGroupObject.pick({
  name: true,
  description: true,
  numberOfVoters: true,
  ballotPapers: true,
});

export type UpdateableVoterGroup = z.infer<typeof UpdateableVoterGroupObject>;

export const UpdateableVoterGroupObjectSchema = z.toJSONSchema(
  UpdateableVoterGroupObject,
  toJsonSchemaParams,
);
