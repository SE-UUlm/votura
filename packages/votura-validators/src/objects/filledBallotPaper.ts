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
  "Each vote must contain exactly one 'noVote' field, exactly one 'invalid' field, and at least one additional UUID field.";

const voteTypeRefinement = (vote: Record<string, unknown>): boolean => {
  const values = Object.values(vote);

  // Check if PlainVotes only
  if (values.every((value) => PlainVoteObject.safeParse(value).success)) {
    return true;
  }
  // Check if EncryptedVotes only
  if (values.every((value) => EncryptedVoteObject.safeParse(value).success)) {
    return true;
  }

  return false;
};

const voteTypeRefinementMessage =
  'Each vote must consist exclusively of either PlainVotes or EncryptedVotes, but not a mix of both.';

const voteCountRefinement = (vote: Record<string, unknown>): boolean => {
  const values = Object.values(vote);

  // This refinement is for PlainVotes only
  if (values.every((value) => !PlainVoteObject.safeParse(value).success)) {
    return true;
  }

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

const EncryptedVoteObject = z.object({
  alpha: z.bigint().register(voturaMetadataRegistry, {
    description:
      'First part of the ciphertext determining if this option was voted on with the vote represented by the enclosing json object.',
    example: 12345,
  }),
  beta: z.bigint().register(voturaMetadataRegistry, {
    description:
      'Second part of the ciphertext determining if this option was voted on with the vote represented by the enclosing json object.',
    example: 67890,
  }),
  commitment1: z.bigint().register(voturaMetadataRegistry, {
    description:
      'Part of the zero-knowledge proof to show that exactly one option in the enclosing json object was chosen.',
    example: 1345789,
  }),
  commitment2: z.bigint().register(voturaMetadataRegistry, {
    description:
      'Part of the zero-knowledge proof to show that exactly one option in the enclosing json object was chosen.',
    example: 9072314,
  }),
  challenge: z.bigint().register(voturaMetadataRegistry, {
    description:
      'Part of the zero-knowledge proof to show that exactly one option in the enclosing json object was chosen. Random value for unchosen option.',
    example: 76687914,
  }),
  response: z.bigint().register(voturaMetadataRegistry, {
    description:
      'Part of the zero-knowledge proof to show that exactly one option in the enclosing json object was chosen. Random value for unchosen option.',
    example: 2013945,
  }),
});

export type EncryptedVote = z.infer<typeof EncryptedVoteObject>;

const PlainVoteObject = z.number().int().min(0).max(1);
export type PlainVote = z.infer<typeof PlainVoteObject>;

const filledBallotPaperObject = <T extends PlainVote | EncryptedVote>(voteSchema: z.ZodType<T>) =>
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
            z
              .record(
                z.union([
                  z.uuidv4().register(voturaMetadataRegistry, {
                    description: 'The unique identifier of the candidate.',
                    example: '123e4567-e89b-12d3-a456-426614174000',
                  }),
                  z.literal(filledBallotPaperDefaultVoteOption.noVote),
                  z.literal(filledBallotPaperDefaultVoteOption.invalid),
                ]),
                voteSchema,
              )
              .refine((vote) => voteStructureRefinement(vote), {
                message: voteStructureRefinementMessage,
              })
              .refine((vote) => voteTypeRefinement(vote), {
                message: voteTypeRefinementMessage,
              })
              .refine((vote) => voteCountRefinement(vote), {
                message: voteCountRefinementMessage,
              }),
          )
          .min(1),
      }),
    ),
  });

export type FilledBallotPaper<T extends PlainVote | EncryptedVote> = z.infer<
  typeof filledBallotPaperObject<T>
>;

export const plainFilledBallotPaperObject = filledBallotPaperObject(PlainVoteObject);
export type PlainFilledBallotPaper = z.infer<typeof plainFilledBallotPaperObject>;

export const encryptedFilledBallotPaperObject = filledBallotPaperObject(EncryptedVoteObject);
export type EncryptedFilledBallotPaper = z.infer<typeof encryptedFilledBallotPaperObject>;

export const filledBallotPaperObjectSchema = <T extends PlainVote | EncryptedVote>(
  voteSchema: z.ZodType<T>,
): Record<string, any> => z.toJSONSchema(filledBallotPaperObject(voteSchema), toJsonSchemaParams);
