import { z } from 'zod/v4';
import { toJsonSchemaParams } from '../parserParams.js';

import { voturaMetadataRegistry } from '../voturaMetadateRegistry.js';

export const filledBallotPaperDefaultVoteOption = {
  noVote: 'noVote',
  invalid: 'invalid',
} as const;

const voteStructureRefinement = (vote: Record<string, unknown>): boolean => {
  const keys = Object.keys(vote);

  // Check for exactly one 'noVote' field
  const noVoteCount = keys.filter(
    (key) => key === filledBallotPaperDefaultVoteOption.noVote,
  ).length;
  if (noVoteCount !== 1) {
    return false;
  }

  // Check for exactly one 'invalid' field
  const invalidCount = keys.filter(
    (key) => key === filledBallotPaperDefaultVoteOption.invalid,
  ).length;
  if (invalidCount !== 1) {
    return false;
  }
  // Check for at least one additional UUID field (not 'noVote' or 'invalid')
  const uuidFields = keys.filter(
    (key) =>
      key !== filledBallotPaperDefaultVoteOption.noVote &&
      key !== filledBallotPaperDefaultVoteOption.invalid,
  );
  return uuidFields.length >= 1;
};

const voteStructureRefinementMessage =
  "Each vote must contain exactly one 'noVote' field, exactly one 'invalid' field, and at least one additional UUID field";

export const filledBallotPaperObject = <T extends z.ZodType<Record<string, unknown>>>(
  voteSchema: T,
) =>
  z.object({
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
            voteSchema.refine(
              (vote) => voteStructureRefinement(vote as unknown as Record<string, unknown>),
              {
                message: voteStructureRefinementMessage,
              },
            ),
          )
          .min(1),
      }),
    ),
  });

export type FilledBallotPaper = z.infer<typeof filledBallotPaperObject>;

export const filledBallotPaperObjectSchema = <T extends z.ZodType<Record<string, unknown>>>(
  voteSchema: T,
) => z.toJSONSchema(filledBallotPaperObject(voteSchema), toJsonSchemaParams);
