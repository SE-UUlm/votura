import { z } from 'zod/v4';
import { IdentifiableTimestampedObject } from './identifiableTimestampedObject.js';
import { voturaMetadataRegistry } from '../voturaMetadateRegistry.js';
import { BallotPaperObject } from './ballotPaper.js';
import { toJsonSchemaParams } from '../parserParams.js';

export const BallotPaperSectionObject = z.object({
  ...IdentifiableTimestampedObject.shape,
  name: z.string().min(1).max(256).register(voturaMetadataRegistry, {
    description: 'The name of the ballot paper section.',
  }),
  description: z.string().min(1).max(256).optional().register(voturaMetadataRegistry, {
    description: 'The description text of the ballot paper section.',
  }),
  maxVotes: z
    .int32()
    .min(1)
    .register(voturaMetadataRegistry, {
      description:
        'The user can limit the votes per ballot paper section.\n' +
        'This is the maximum number of votes a voter can cast on this ballot paper section. \n' +
        '`maxVotes` of a ballot paper section needs to be smaller or equal to the over all `maxVotes` on the linked parent ballot paper.\n' +
        'If the ballot paper section contains more votes than the `maxVotes` value, the whole vote / ballot paper will be invalid.',
      example: 42,
    }),
  maxVotesPerCandidate: z
    .int32()
    .min(1)
    .register(voturaMetadataRegistry, {
      description:
        'The user can limit the allowed number of votes per candidate.\n' +
        'This is the maximum number of votes a voter can cast on one candidate on this ballot paper sections.\n' +
        '`maxVotesPerCandidate` of a ballot paper section needs to be smaller or equal to the over all `maxVotesPerCandidate` on the linked parent ballot paper.\n' +
        'If the ballot paper section contains more votes on one candidate than the `maxVotesPerCandidate` value, the whole vote / ballot paper will be invalid.',
      example: 42,
    }),
  ballotPaperId: BallotPaperObject.shape.id.register(voturaMetadataRegistry, {
    description: 'The ID of the ballot paper to which this ballot paper section belongs.',
    example: '4ef40d09-abe9-4c3f-8176-764eb0e5e70d',
  }),
});

export type BallotPaperSection = z.infer<typeof BallotPaperSectionObject>;

export const InsertableBallotPaperSectionObject = BallotPaperSectionObject.pick({
  name: true,
  description: true,
  maxVotes: true,
  maxVotesPerCandidate: true,
  ballotPaperId: true,
});

export type InsertableBallotPaperSection = z.infer<typeof InsertableBallotPaperSectionObject>;

export const InsertableBallotPaperSectionObjectSchema = z.toJSONSchema(
  InsertableBallotPaperSectionObject,
  toJsonSchemaParams,
);

export const SelectableBallotPaperSectionObject = BallotPaperSectionObject.pick({
  id: true,
  createdAt: true,
  modifiedAt: true,
  name: true,
  description: true,
  maxVotes: true,
  maxVotesPerCandidate: true,
  ballotPaperId: true,
});

export type SelectableBallotPaperSection = z.infer<typeof SelectableBallotPaperSectionObject>;

export const SelectableBallotPaperSectionObjectSchema = z.toJSONSchema(
  SelectableBallotPaperSectionObject,
  toJsonSchemaParams,
);

export const UpdateableBallotPaperSectionObject = BallotPaperSectionObject.pick({
  name: true,
  description: true,
  maxVotes: true,
  maxVotesPerCandidate: true,
});

export type UpdateableBallotPaperSection = z.infer<typeof UpdateableBallotPaperSectionObject>;

export const UpdateableBallotPaperSectionObjectSchema = z.toJSONSchema(
  UpdateableBallotPaperSectionObject,
  toJsonSchemaParams,
);
