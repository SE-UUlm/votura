import { z } from 'zod/v4';
import { toJsonSchemaParams } from '../parserParams.js';

import { voturaMetadataRegistry } from '../voturaMetadateRegistry.js';

export const filledBallotPaperDefaultVoteOption = {
  noVote: 'noVote',
  invalid: 'invalid',
} as const;

const zkProofShape = {
  commitment1: z.string().regex(/^\d+$/).register(voturaMetadataRegistry, {
    description: 'First commitment of the zero-knowledge proof.',
    example: '1345789',
  }),
  commitment2: z.string().regex(/^\d+$/).register(voturaMetadataRegistry, {
    description: 'Second commitment of the zero-knowledge proof.',
    example: '9072314',
  }),
  challenge: z.string().regex(/^\d+$/).register(voturaMetadataRegistry, {
    description: 'Challenge of the zero-knowledge proof.',
    example: '76687914',
  }),
  response: z.string().regex(/^\d+$/).register(voturaMetadataRegistry, {
    description: 'Response of the zero-knowledge proof.',
    example: '2013945',
  }),
};

const zkProofObject = (description: string): z.ZodObject<typeof zkProofShape> =>
  z.object(zkProofShape).register(voturaMetadataRegistry, { description });

const encryptedVoteObject = z.object({
  alpha: z.string().regex(/^\d+$/).register(voturaMetadataRegistry, {
    description:
      'First part of the ciphertext determining if this option was voted on with the vote represented by the enclosing json object.',
    example: '12345',
  }),
  beta: z.string().regex(/^\d+$/).register(voturaMetadataRegistry, {
    description:
      'Second part of the ciphertext determining if this option was voted on with the vote represented by the enclosing json object.',
    example: '67890',
  }),
  zeroProof: zkProofObject(
    'Proof that the ciphertext encrypts 0. Together with oneProof it shows that the ciphertext encrypts 0 or 1 without revealing which. Simulated if this option was chosen.',
  ),
  oneProof: zkProofObject(
    'Proof that the ciphertext encrypts 1. Together with zeroProof it shows that the ciphertext encrypts 0 or 1 without revealing which. Simulated if this option was not chosen.',
  ),
});
const plainVoteObject = z.number().int().min(0).max(1);

export type EncryptedVote = z.infer<typeof encryptedVoteObject>;
export type EncryptedVoteProof = EncryptedVote['zeroProof'];
export type PlainVote = z.infer<typeof plainVoteObject>;

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
  if (values.every((value) => plainVoteObject.safeParse(value).success)) {
    return true;
  }
  // Check if EncryptedVotes only
  if (values.every((value) => encryptedVoteObject.safeParse(value).success)) {
    return true;
  }

  return false;
};

const voteTypeRefinementMessage =
  'Each vote must consist exclusively of either PlainVotes or EncryptedVotes, but not a mix of both.';

const voteCountRefinement = (vote: Record<string, unknown>): boolean => {
  const values = Object.values(vote);

  // This refinement is for PlainVotes only
  if (values.every((value) => !plainVoteObject.safeParse(value).success)) {
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

type Votes<T extends PlainVote | EncryptedVote> = z.ZodArray<
  z.ZodRecord<
    z.ZodUnion<
      readonly [
        z.ZodUUID,
        z.ZodLiteral<typeof filledBallotPaperDefaultVoteOption.noVote>,
        z.ZodLiteral<typeof filledBallotPaperDefaultVoteOption.invalid>,
      ]
    >,
    z.ZodType<T>
  >
>;

const votesArray = <T extends PlainVote | EncryptedVote>(voteSchema: z.ZodType<T>): Votes<T> =>
  z
    .array(
      z
        .record(
          z.union([
            z.uuidv4().register(voturaMetadataRegistry, {
              description: 'The unique identifier of the candidate.',
              example: 'f792d5ca-65aa-4167-8f83-06e909051005',
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
    .min(1);

type FilledBallotPaper<Section extends z.ZodType> = z.ZodObject<
  {
    ballotPaperId: z.ZodUUID;
    sections: z.ZodRecord<z.ZodUUID, Section>;
  },
  z.core.$strip
>;

const filledBallotPaperObject = <Section extends z.ZodType>(
  sectionSchema: Section,
): FilledBallotPaper<Section> =>
  z.object({
    ballotPaperId: z.uuidv4().register(voturaMetadataRegistry, {
      description: 'The unique identifier of the voted/filled ballot paper.',
      example: '2d38c96f-42ac-4c3f-9734-7193e9c64424',
    }),
    sections: z.record(
      z.uuidv4().register(voturaMetadataRegistry, {
        description: 'The unique identifier of the voted/filled ballot paper section.',
        example: '123e4567-e89b-12d3-a456-426614174000',
      }),
      sectionSchema,
    ),
  });

const encryptedSectionObject = z
  .object({
    votes: votesArray(encryptedVoteObject),
    overallProofs: z
      .array(
        zkProofObject(
          'Proof that the options of the vote at the same index in votes together encrypt exactly 1, so exactly one option was chosen.',
        ),
      )
      .register(voturaMetadataRegistry, {
        description: 'One proof per vote, in the same order as votes.',
      }),
  })
  .refine((section) => section.overallProofs.length === section.votes.length, {
    message: 'Each vote must have exactly one overall proof.',
  });

export const plainFilledBallotPaperObject = filledBallotPaperObject(
  z.object({ votes: votesArray(plainVoteObject) }),
);
export type PlainFilledBallotPaper = z.infer<typeof plainFilledBallotPaperObject>;

export const encryptedFilledBallotPaperObject = filledBallotPaperObject(encryptedSectionObject);
export type EncryptedFilledBallotPaper = z.infer<typeof encryptedFilledBallotPaperObject>;

export const plainFilledBallotPaperObjectSchema = z.toJSONSchema(
  plainFilledBallotPaperObject,
  toJsonSchemaParams,
);
export const encryptedFilledBallotPaperObjectSchema = z.toJSONSchema(
  encryptedFilledBallotPaperObject,
  toJsonSchemaParams,
);
