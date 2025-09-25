import { z } from 'zod/v4';
import { toJsonSchemaParams } from '../parserParams.js';

import { voturaMetadataRegistry } from '../voturaMetadateRegistry.js';
import {
  filledBallotPaperDefaultVoteOption,
  filledBallotPaperObject,
} from './filledBallotPaper.js';

const encryptedVoteSchema = z.record(
  z.union([
    z.uuidv4().register(voturaMetadataRegistry, {
      description: 'The unique identifier of the candidate.',
      example: '123e4567-e89b-12d3-a456-426614174000',
    }),
    z.literal(filledBallotPaperDefaultVoteOption.noVote),
    z.literal(filledBallotPaperDefaultVoteOption.invalid),
  ]),
  z.object({
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
  }),
);

export const encryptedFilledBallotPaperObject = filledBallotPaperObject(encryptedVoteSchema);

export type EncryptedFilledBallotPaper = z.infer<typeof encryptedFilledBallotPaperObject>;

export const encryptedFilledBallotPaperObjectSchema = z.toJSONSchema(
  encryptedFilledBallotPaperObject,
  toJsonSchemaParams,
);
