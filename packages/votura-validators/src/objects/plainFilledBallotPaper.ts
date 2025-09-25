import { z } from 'zod/v4';
import { toJsonSchemaParams } from '../parserParams.js';

import { voturaMetadataRegistry } from '../voturaMetadateRegistry.js';
import {
  filledBallotPaperDefaultVoteOption,
  filledBallotPaperObject,
} from './filledBallotPaper.js';

const voteCountRefinement = (vote: Record<string, number>): boolean => {
  const values = Object.values(vote);

  // Check that exactly one option is 1
  const ones = values.filter((v) => v === 1).length;
  if (ones !== 1) {
    return false;
  }
  // Check that all other options are zero
  return values.every((v) => v === 0 || v === 1);
};

const voteCountRefinementMessage =
  'Each vote must have exactly one option set to 1, all other options must be 0.';

const plainVoteSchema = z
  .record(
    z.union([
      z.uuidv4().register(voturaMetadataRegistry, {
        description: 'The unique identifier of the candidate.',
        example: '123e4567-e89b-12d3-a456-426614174000',
      }),
      z.literal(filledBallotPaperDefaultVoteOption.noVote),
      z.literal(filledBallotPaperDefaultVoteOption.invalid),
    ]),
    z.number().int().min(0).max(1),
  )
  .refine(voteCountRefinement, {
    message: voteCountRefinementMessage,
  });

export const plainFilledBallotPaperObject = filledBallotPaperObject(plainVoteSchema);

export type PlainFilledBallotPaper = z.infer<typeof plainFilledBallotPaperObject>;

export const plainFilledBallotPaperObjectSchema = z.toJSONSchema(
  plainFilledBallotPaperObject,
  toJsonSchemaParams,
);
