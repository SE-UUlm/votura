import { z } from 'zod/v4';
import { toJsonSchemaParams } from '../parserParams.js';

import { voturaMetadataRegistry } from '../voturaMetadateRegistry.js';

const voteStructureRefinement = (vote: Record<string, unknown>): boolean => {
  const keys = Object.keys(vote);

  // Check for exactly one 'noVote' field
  const noVoteCount = keys.filter((key) => key === 'noVote').length;
  if (noVoteCount !== 1) {
    return false;
  }

  // Check for exactly one 'invalid' field
  const invalidCount = keys.filter((key) => key === 'invalid').length;
  if (invalidCount !== 1) {
    return false;
  }
  // Check for at least one additional UUID field (not 'noVote' or 'invalid')
  const uuidFields = keys.filter((key) => key !== 'noVote' && key !== 'invalid');
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
                z.literal('noVote'),
                z.literal('invalid'),
              ]),
              z.object({
                alpha: z.number().register(voturaMetadataRegistry, {
                  description:
                    'First part of the ciphertext determining if this candidate was voted with the vote represented by this json object. Maximum of 2048 bits long.',
                  example: 12345,
                }),
                beta: z.number().register(voturaMetadataRegistry, {
                  description:
                    'Second part of the ciphertext determining if this candidate was voted with the vote represented by this json object. Maximum of 2048 bits long.',
                  example: 67890,
                }),
                commitment1: z.number().register(voturaMetadataRegistry, {
                  description: 'TODO',
                }),
                commitment2: z.number().register(voturaMetadataRegistry, {
                  description: 'TODO',
                }),
                challenge: z.number().register(voturaMetadataRegistry, {
                  description: 'TODO',
                }),
                response: z.number().register(voturaMetadataRegistry, {
                  description: 'TODO',
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

// TODO: Write refine function: only one g^1 per vote, else g^0. Possible? How? Clever/practical?
// TODO: Write tests for the refine functions.
// TODO: provide examples values
// TODO: provide descriptions for all fields
// TODO: test: to JSON schema -> display in OpenAPI definition -> docusaurus
// TODO: Write docs page explaining the voting object / matrix.
