import { z } from 'zod/v4';
import { toJsonSchemaParams } from '../parserParams.js';
import { voturaMetadataRegistry } from '../voturaMetadateRegistry.js';
import { electionObject } from './election.js';
import { identifiableTimestampedObject } from './identifiableTimestampedObject.js';

export const ballotPaperObject = z.object({
  ...identifiableTimestampedObject.shape,
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
  electionId: electionObject.shape.id.register(voturaMetadataRegistry, {
    description: 'The ID of the election to which this ballot paper belongs.',
    example: '4ef40d09-abe9-4c3f-8176-764eb0e5e70d',
  }),
});

export type BallotPaper = z.infer<typeof ballotPaperObject>;

export const insertableBallotPaperObject = ballotPaperObject.pick({
  name: true,
  description: true,
  maxVotes: true,
  maxVotesPerCandidate: true,
  electionId: true,
});

export type InsertableBallotPaper = z.infer<typeof insertableBallotPaperObject>;

export const insertableBallotPaperObjectSchema = z.toJSONSchema(
  insertableBallotPaperObject,
  toJsonSchemaParams,
);

export const selectableBallotPaperObject = ballotPaperObject.pick({
  id: true,
  modifiedAt: true,
  createdAt: true,
  name: true,
  description: true,
  maxVotes: true,
  maxVotesPerCandidate: true,
  electionId: true,
});

export type SelectableBallotPaper = z.infer<typeof selectableBallotPaperObject>;

export const selectableBallotPaperObjectSchema = z.toJSONSchema(
  selectableBallotPaperObject,
  toJsonSchemaParams,
);

export const updateableBallotPaperObject = ballotPaperObject.pick({
  name: true,
  description: true,
  maxVotes: true,
  maxVotesPerCandidate: true,
});

export type UpdateableBallotPaper = z.infer<typeof updateableBallotPaperObject>;

export const updateableBallotPaperObjectSchema = z.toJSONSchema(
  updateableBallotPaperObject,
  toJsonSchemaParams,
);
