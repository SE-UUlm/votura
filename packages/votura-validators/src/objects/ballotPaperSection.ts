import { z } from 'zod/v4';
import { toJsonSchemaParams } from '../parserParams.js';
import { voturaMetadataRegistry } from '../voturaMetadateRegistry.js';
import { ballotPaperObject } from './ballotPaper.js';
import { candidateObject } from './candidate.js';
import { identifiableTimestampedObject } from './identifiableTimestampedObject.js';
import { maxVotesRefinement, maxVotesRefinementMessage } from './refines.js';

export const ballotPaperSectionObject = z.object({
  ...identifiableTimestampedObject.shape,
  name: z.string().min(1).max(256).register(voturaMetadataRegistry, {
    description: 'The name of the ballot paper section.',
    example: 'My important ballot paper section',
  }),
  description: z.string().min(1).max(256).optional().register(voturaMetadataRegistry, {
    description: 'The description text of the ballot paper section.',
    example: 'This section is about my important topic.',
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
        'Furthermore, `maxVotesPerCandidate` of a ballot paper section needs to be smaller or equal to the `maxVotes` of the same ballot paper section.\n' +
        'If the ballot paper section contains more votes on one candidate than the `maxVotesPerCandidate` value, the whole vote / ballot paper will be invalid.',
      example: 42,
    }),
  candidateIds: z.array(candidateObject.shape.id).min(0).register(voturaMetadataRegistry, {
    description: 'The IDs of the candidates that are part of this ballot paper section.',
  }),
  ballotPaperId: ballotPaperObject.shape.id.register(voturaMetadataRegistry, {
    description: 'The ID of the ballot paper to which this ballot paper section belongs.',
    example: '4ef40d09-abe9-4c3f-8176-764eb0e5e70d',
  }),
});

export type BallotPaperSection = z.infer<typeof ballotPaperSectionObject>;

export const insertableBallotPaperSectionObject = ballotPaperSectionObject
  .pick({
    name: true,
    description: true,
    maxVotes: true,
    maxVotesPerCandidate: true,
  })
  .refine(maxVotesRefinement, {
    message: maxVotesRefinementMessage,
    path: ['maxVotes'],
  });

export type InsertableBallotPaperSection = z.infer<typeof insertableBallotPaperSectionObject>;

export const insertableBallotPaperSectionObjectSchema = z.toJSONSchema(
  insertableBallotPaperSectionObject,
  toJsonSchemaParams,
);

export const selectableBallotPaperSectionObject = ballotPaperSectionObject.pick({
  id: true,
  createdAt: true,
  modifiedAt: true,
  name: true,
  description: true,
  maxVotes: true,
  maxVotesPerCandidate: true,
  candidateIds: true,
  ballotPaperId: true,
});

export type SelectableBallotPaperSection = z.infer<typeof selectableBallotPaperSectionObject>;

export const selectableBallotPaperSectionObjectSchema = z.toJSONSchema(
  selectableBallotPaperSectionObject,
  toJsonSchemaParams,
);

export const updateableBallotPaperSectionObject = ballotPaperSectionObject
  .pick({
    name: true,
    description: true,
    maxVotes: true,
    maxVotesPerCandidate: true,
  })
  .refine(maxVotesRefinement, {
    message: maxVotesRefinementMessage,
    path: ['maxVotes'],
  });

export type UpdateableBallotPaperSection = z.infer<typeof updateableBallotPaperSectionObject>;

export const updateableBallotPaperSectionObjectSchema = z.toJSONSchema(
  updateableBallotPaperSectionObject,
  toJsonSchemaParams,
);

export const updateableCandidateOperationOptions = {
  add: 'add',
  remove: 'remove',
} as const;

export const updateableBallotPaperSectionCandidateObject = z.object({
  candidateId: candidateObject.shape.id.register(voturaMetadataRegistry, {
    description:
      'The ID of the candidate that should be added to or removed from this ballot paper section.',
  }),
  operation: z
    .enum([updateableCandidateOperationOptions.add, updateableCandidateOperationOptions.remove])
    .register(voturaMetadataRegistry, {
      description:
        'The operation to perform: add or remove the candidate from the ballot paper section.',
      example: updateableCandidateOperationOptions.add,
    }),
});

export type UpdateableBallotPaperSectionCandidate = z.infer<
  typeof updateableBallotPaperSectionCandidateObject
>;

export const updateableBallotPaperSectionCandidateObjectSchema = z.toJSONSchema(
  updateableBallotPaperSectionCandidateObject,
  toJsonSchemaParams,
);
