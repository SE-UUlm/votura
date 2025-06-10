import { z } from 'zod/v4';
import { IdentifiableTimestampedObject } from './identifiableTimestampedObject.js';
import { voturaMetadataRegistry } from '../voturaMetadateRegistry.js';
import { toJsonSchemaParams } from '../parserParams.js';

export const BallotPaperObject = z.object({
  ...IdentifiableTimestampedObject.shape,
  name: z.string().min(1).max(256).register(voturaMetadataRegistry, {
    description: 'The name of the ballot paper.',
  }),
  description: z.string().min(1).max(256).optional().register(voturaMetadataRegistry, {
    description: 'The description text of the ballot paper.',
  }),
  maxVotes: z
    .int32()
    .min(1)
    .register(voturaMetadataRegistry, {
      description:
        'The user can limit the votes per ballot paper.\n' +
        'This is the maximum number of votes a voter can cast on this ballot paper over all ballot paper sections.\n' +
        'If the ballot paper contains more votes than the `maxVotes` value over all ballot paper sections, the vote / ballot paper will be invalid.',
      example: 42,
    }),
  maxVotesPerCandidate: z
    .int32()
    .min(1)
    .register(voturaMetadataRegistry, {
      description:
        'The user can limit the allowed number of votes per candidate.\n' +
        'This is the maximum number of votes a voter can cast on one candidate over all ballot paper sections.\n' +
        'If the ballot paper contains more votes on one candidate than the `maxVotesPerCandidate` value, the vote / ballot paper will be invalid.',
      example: 42,
    }),
  electionId: z.uuidv4().register(voturaMetadataRegistry, {
    description: 'The ID of the election to which this ballot paper belongs.',
    example: '4ef40d09-abe9-4c3f-8176-764eb0e5e70d',
  }),
});

export type BallotPaper = z.infer<typeof BallotPaperObject>;

export const InsertableBallotPaperObject = BallotPaperObject.pick({
  name: true,
  description: true,
  maxVotes: true,
  maxVotesPerCandidate: true,
  electionId: true,
});

export type InsertableBallotPaper = z.infer<typeof InsertableBallotPaperObject>;

export const InsertableBallotPaperObjectSchema = z.toJSONSchema(
  InsertableBallotPaperObject,
  toJsonSchemaParams,
);

export const SelectableBallotPaperObject = BallotPaperObject.pick({
  id: true,
  modifiedAt: true,
  createdAt: true,
  name: true,
  description: true,
  maxVotes: true,
  maxVotesPerCandidate: true,
  electionId: true,
});

export type SelectableBallotPaper = z.infer<typeof SelectableBallotPaperObject>;

export const SelectableBallotPaperObjectSchema = z.toJSONSchema(
  SelectableBallotPaperObject,
  toJsonSchemaParams,
);

export const UpdateableBallotPaperObject = BallotPaperObject.pick({
  name: true,
  description: true,
  maxVotes: true,
  maxVotesPerCandidate: true,
});

export type UpdateableBallotPaper = z.infer<typeof UpdateableBallotPaperObject>;

export const UpdateableBallotPaperObjectSchema = z.toJSONSchema(
  UpdateableBallotPaperObject,
  toJsonSchemaParams,
);
