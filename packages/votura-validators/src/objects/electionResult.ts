import { z } from 'zod/v4';
import { toJsonSchemaParams } from '../parserParams.js';
import { voturaMetadataRegistry } from '../voturaMetadateRegistry.js';
import { selectableBallotPaperObject } from './ballotPaper.js';
import { selectableBallotPaperSectionObject } from './ballotPaperSection.js';
import { selectableCandidateObject } from './candidate.js';
import { electionObject } from './election.js';

const aggregatedCiphertextObject = z.object({
  alpha: z.string().regex(/^\d+$/).register(voturaMetadataRegistry, {
    description: 'First part of the aggregated ciphertext.',
    example: '12345',
  }),
  beta: z.string().regex(/^\d+$/).register(voturaMetadataRegistry, {
    description: 'Second part of the aggregated ciphertext.',
    example: '67890',
  }),
});

const decryptionProofObject = z.object({
  commitment1: z.string().regex(/^\d+$/).register(voturaMetadataRegistry, {
    description: 'First commitment of the zero-knowledge proof for the decryption.',
    example: '1345789',
  }),
  commitment2: z.string().regex(/^\d+$/).register(voturaMetadataRegistry, {
    description: 'Second commitment of the zero-knowledge proof for the decryption.',
    example: '9072314',
  }),
  challenge: z.string().regex(/^\d+$/).register(voturaMetadataRegistry, {
    description: 'Challenge of the zero-knowledge proof for the decryption.',
    example: '76687914',
  }),
  response: z.string().regex(/^\d+$/).register(voturaMetadataRegistry, {
    description: 'Response of the zero-knowledge proof for the decryption.',
    example: '2013945',
  }),
});

export const selectableElectionResultObject = z.object({
  electionId: electionObject.shape.id.register(voturaMetadataRegistry, {
    description: 'The ID of the election to which this result belongs.',
    example: '4ef40d09-abe9-4c3f-8176-764eb0e5e70d',
  }),
  publishedAt: z.iso.datetime().register(voturaMetadataRegistry, {
    description: 'The date when the result of the election was published.',
  }),
  // The election itself is not public, so the key is included to verify the decryption proofs.
  ...electionObject.pick({ pubKey: true, primeP: true, primeQ: true, generator: true }).shape,
  ballotPapers: z
    .array(
      selectableBallotPaperObject.pick({ id: true, name: true }).extend({
        ballotsCast: z.int32().min(0).register(voturaMetadataRegistry, {
          description: 'The number of ballots cast on this ballot paper.',
          example: 42,
        }),
        invalidCount: z.int32().min(0).register(voturaMetadataRegistry, {
          description: 'The number of invalid ballots cast on this ballot paper.',
          example: 2,
        }),
        ballotPaperSections: z
          .array(
            selectableBallotPaperSectionObject.pick({ id: true, name: true }).extend({
              noVoteCount: z.int32().min(0).register(voturaMetadataRegistry, {
                description: 'The number of abstentions in this ballot paper section.',
                example: 3,
              }),
              candidates: z
                .array(
                  selectableCandidateObject.pick({ id: true, title: true }).extend({
                    count: z.int32().min(0).register(voturaMetadataRegistry, {
                      description:
                        'The number of votes for this candidate in this ballot paper section.',
                      example: 37,
                    }),
                    ciphertext: aggregatedCiphertextObject,
                    proof: decryptionProofObject,
                  }),
                )
                .min(1),
            }),
          )
          .min(1),
      }),
    )
    .min(1),
});

export type SelectableElectionResult = z.infer<typeof selectableElectionResultObject>;

export const selectableElectionResultObjectSchema = z.toJSONSchema(
  selectableElectionResultObject,
  toJsonSchemaParams,
);
