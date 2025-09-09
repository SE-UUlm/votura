import { z } from 'zod/v4';
import { toJsonSchemaParams } from '../parserParams.js';

import { voturaMetadataRegistry } from '../voturaMetadateRegistry.js';

export enum FilledBallotPaperDefaultVoteOption {
  noVote = 'noVote',
  invalid = 'invalid',
}

const voteStructureRefinement = (vote: Record<string, unknown>): boolean => {
  const keys = Object.keys(vote);

  // Check for exactly one 'noVote' field
  const noVoteCount = keys.filter(
    (key) => key === FilledBallotPaperDefaultVoteOption.noVote.toString(),
  ).length;
  if (noVoteCount !== 1) {
    return false;
  }

  // Check for exactly one 'invalid' field
  const invalidCount = keys.filter(
    (key) => key === FilledBallotPaperDefaultVoteOption.invalid.toString(),
  ).length;
  if (invalidCount !== 1) {
    return false;
  }
  // Check for at least one additional UUID field (not 'noVote' or 'invalid')
  const uuidFields = keys.filter(
    (key) =>
      key !== FilledBallotPaperDefaultVoteOption.noVote.toString() &&
      key !== FilledBallotPaperDefaultVoteOption.invalid.toString(),
  );
  return uuidFields.length >= 1;
};

const voteStructureRefinementMessage =
  "Each vote must contain exactly one 'noVote' field, exactly one 'invalid' field, and at least one additional UUID field";

export const filledBallotPaperObject = z.object({
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
                z.literal(FilledBallotPaperDefaultVoteOption.noVote.toString()),
                z.literal(FilledBallotPaperDefaultVoteOption.invalid.toString()),
              ]),
              z.object({
                alpha: z.number().register(voturaMetadataRegistry, {
                  description:
                    'First part of the ciphertext determining if this option was voted on with the vote represented by the enclosing json object.',
                  example: 12345,
                }),
                beta: z.number().register(voturaMetadataRegistry, {
                  description:
                    'Second part of the ciphertext determining if this option was voted on with the vote represented by the enclosing json object.',
                  example: 67890,
                }),
                commitment1: z.number().register(voturaMetadataRegistry, {
                  description:
                    'Part of the zero-knowledge proof to show that exactly one option in the enclosing json object was chosen.',
                  example: 1345789,
                }),
                commitment2: z.number().register(voturaMetadataRegistry, {
                  description:
                    'Part of the zero-knowledge proof to show that exactly one option in the enclosing json object was chosen.',
                  example: 9072314,
                }),
                challenge: z.number().register(voturaMetadataRegistry, {
                  description:
                    'Part of the zero-knowledge proof to show that exactly one option in the enclosing json object was chosen. Random value for unchosen option.',
                  example: 76687914,
                }),
                response: z.number().register(voturaMetadataRegistry, {
                  description:
                    'Part of the zero-knowledge proof to show that exactly one option in the enclosing json object was chosen. Random value for unchosen option.',
                  example: 2013945,
                }),
              }),
            )
            .refine(voteStructureRefinement, {
              message: voteStructureRefinementMessage,
            }),
        )
        .min(1),
    }),
  ),
});

export type FilledBallotPaper = z.infer<typeof filledBallotPaperObject>;

export const filledBallotPaperObjectSchema = z.toJSONSchema(
  filledBallotPaperObject,
  toJsonSchemaParams,
);
