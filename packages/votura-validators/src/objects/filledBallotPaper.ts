import { z } from 'zod/v4';
import { toJsonSchemaParams } from '../parserParams.js';

import { voturaMetadataRegistry } from '../voturaMetadateRegistry.js';

export const filledBallotPaperObject = z.object({
  ballotPaperId: z.uuidv4().register(voturaMetadataRegistry, {
    description: 'The unique identifier of the voted/filled ballot paper.',
    example: '123e4567-e89b-12d3-a456-426614174000',
  }),
  sections: z.object(
    z.record(
      z.uuidv4().register(voturaMetadataRegistry, {
        description: 'The unique identifier of the voted/filled ballot paper section.',
        example: '123e4567-e89b-12d3-a456-426614174000',
      }),
      z.object({
        votes: z
          .array(
            z.object(
              z.record(
                z.union([
                  z.uuidv4().register(voturaMetadataRegistry, {
                    description: 'The unique identifier of the candidate.',
                    example: '123e4567-e89b-12d3-a456-426614174000',
                  }),
                  z.enum(['noVote', 'invalid']),
                ]),
                z.object({
                  alpha: z.number().register(voturaMetadataRegistry, {
                    description: 'TODO',
                  }),
                  beta: z.number().register(voturaMetadataRegistry, {
                    description: 'TODO',
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
              ),
            ),
          )
          .min(1),
      }),
    ),
  ),
});

export type FilledBallotPaper = z.infer<typeof filledBallotPaperObject>;

export const filledBallotPaperObjectSchema = z.toJSONSchema(
  filledBallotPaperObject,
  toJsonSchemaParams,
);

// TODO: Write refine function: every vote object needs >= 1 Candidates, = 1 'noVote' & = 1 'invalid'
// TODO: Write refine function: only one g^1 per vote, else g^0. Possible? How? Clever/practical?
// TODO: Write tests for the refine functions.
// TODO: provide examples values
// TODO: provide descriptions for all fields
// TODO: test: to JSON schema -> display in OpenAPI definition -> docusaurus
// TODO: Write docs page explaining the voting object / matrix.
