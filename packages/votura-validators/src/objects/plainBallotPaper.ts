import { z } from 'zod/v4';
import { toJsonSchemaParams } from '../parserParams.js';

import { voturaMetadataRegistry } from '../voturaMetadateRegistry.js';

export const plainBallotPaperDefaultVoteOption = {
  noVote: 'noVote',
  invalid: 'invalid',
} as const;

const voteStructureRefinement = (vote: Record<string, unknown>): boolean => {
  const keys = Object.keys(vote);

  // Check for exactly one 'noVote' field
  const noVoteCount = keys.filter((key) => key === plainBallotPaperDefaultVoteOption.noVote).length;
  if (noVoteCount !== 1) {
    return false;
  }
  // Check for exactly one 'invalid' field
  const invalidCount = keys.filter(
    (key) => key === plainBallotPaperDefaultVoteOption.invalid,
  ).length;
  if (invalidCount !== 1) {
    return false;
  }
  // Check for at least one additional UUID field (not 'noVote' or 'invalid')
  const uuidFields = keys.filter(
    (key) =>
      key !== plainBallotPaperDefaultVoteOption.noVote &&
      key !== plainBallotPaperDefaultVoteOption.invalid,
  );
  return uuidFields.length >= 1;
};

const voteStructureRefinementMessage =
  "Each vote must contain exactly one 'noVote' field, exactly one 'invalid' field, and at least one additional UUID field";

const voteCountRefinement = (vote: Record<string, number>): boolean => {
  const values = Object.values(vote);

  // Check that exactly one option is 1
  const ones = values.filter((v) => v === 1).length;
  if (ones !== 1) {
    return false;
  }
  // Check that all other options are zero
  const zerosOrOnes = values.every((v) => v === 0 || v === 1);
  return zerosOrOnes;
};

const voteCountRefinementMessage =
  'Each vote must have exactly one option set to 1, all other options must be 0.';

export const plainBallotPaperObject = z.object({
  ballotPaperId: z.uuidv4().register(voturaMetadataRegistry, {
    description: 'The unique identifier of the voted/filled ballot paper.',
    example: '123e4567-e89b-12d3-a456-426614174000',
  }),
  sections: z.record(
    z.uuidv4().register(voturaMetadataRegistry, {
      description: 'The unique identifier of the voted/filled ballot paper section.',
      example: '123e4567-e89b-12d3-a456-426614174000',
    }),
    z.object({
      votes: z
        .array(
          z
            .record(
              z.union([
                z.uuidv4().register(voturaMetadataRegistry, {
                  description: 'The unique identifier of the candidate.',
                  example: '123e4567-e89b-12d3-a456-426614174000',
                }),
                z.literal(plainBallotPaperDefaultVoteOption.noVote),
                z.literal(plainBallotPaperDefaultVoteOption.invalid),
              ]),
              z.number().int().min(0).max(1),
            )
            .refine(voteStructureRefinement, {
              message: voteStructureRefinementMessage,
            })
            .refine(voteCountRefinement, {
              message: voteCountRefinementMessage,
            }),
        )
        .min(1),
    }),
  ),
});

export type PlainBallotPaper = z.infer<typeof plainBallotPaperObject>;

export const plainBallotPaperObjectSchema = z.toJSONSchema(
  plainBallotPaperObject,
  toJsonSchemaParams,
);
