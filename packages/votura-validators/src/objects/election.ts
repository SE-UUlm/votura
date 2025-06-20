import { z } from 'zod/v4';
import { toJsonSchemaParams } from '../parserParams.js';
import { voturaMetadataRegistry } from '../voturaMetadateRegistry.js';
import { identifiableTimestampedObject } from './identifiableTimestampedObject.js';

export const electionObject = z.object({
  ...identifiableTimestampedObject.shape,
  name: z.string().min(1).max(256).register(voturaMetadataRegistry, {
    description: 'The name of the election.',
  }),
  description: z.string().min(1).max(256).optional().register(voturaMetadataRegistry, {
    description: 'The description text of the election.',
  }),
  private: z.boolean().default(true).register(voturaMetadataRegistry, {
    description:
      'If `private` is set to `false` votura will store a link between the voter and his vote. So every vote can be traced back to the voter. If `private` is set to `true` votura will not store a link between the voter and his vote. So the vote is anonymous and cannot be traced back to the voter.',
  }),
  votingStartAt: z.iso.datetime().register(voturaMetadataRegistry, {
    description:
      'The start date of the voting process of the election. This date needs to be in the future.',
  }),
  votingEndAt: z.iso.datetime().register(voturaMetadataRegistry, {
    description: 'The end date of the voting process of the election. ',
  }),
  configFrozen: z.boolean().default(false).register(voturaMetadataRegistry, {
    description:
      'Indicates if the configuration of the election is frozen. This date needs to be in the future and greater than the `votingStart` date.',
  }),
  allowInvalidVotes: z.boolean().default(false).register(voturaMetadataRegistry, {
    description:
      'Define if a voter is allowed to submit a invalid Vote. There will always a warning message shown to the voter that his vote will be invalid.',
  }),
  pubKey: z.bigint().optional().register(voturaMetadataRegistry, {
    description:
      'The public key to encrypt the vote of the voter. `pubKeyVotes = generator ^ privKeyVotes mod primeP`. This key will only be generated if the election configuration is frozen. If `configFrozen` is set to `false`, the key will be `null`.',
  }),
  privKey: z.bigint().optional(),
  primeP: z.bigint().optional().register(voturaMetadataRegistry, {
    description:
      'A large prime number that defines the group. This key will only be generated if the election configuration is frozen. If `configFrozen` is set to `false`, the key will be `null`.',
  }),
  primeQ: z.bigint().optional().register(voturaMetadataRegistry, {
    description:
      'A prime number that divides `(primeP-1)`, often chosen as `primeQ=(primeP-1)/2`. This key will only be generated if the election configuration is frozen. If `configFrozen` is set to `false`, the key will be `null`.',
  }),
  generator: z.bigint().optional().register(voturaMetadataRegistry, {
    description:
      'The generator of the multiplicative group modulo `primeP`. This key will only be generated if the election configuration is frozen. If `configFrozen` is set to `false`, the key will be `null`.',
  }),
});

export type Election = z.infer<typeof electionObject>;

export const insertableElectionObject = electionObject
  .pick({
    name: true,
    description: true,
    private: true,
    votingStartAt: true,
    votingEndAt: true,
    allowInvalidVotes: true,
  })
  .refine((data) => data.votingStartAt < data.votingEndAt, {
    error: 'votingStartAt must be before votingEndAt',
    path: ['votingEndAt'],
  });

export type InsertableElection = z.infer<typeof insertableElectionObject>;

export const insertableElectionObjectSchema = z.toJSONSchema(
  insertableElectionObject,
  toJsonSchemaParams,
);

export const selectableElectionObject = electionObject.pick({
  id: true,
  createdAt: true,
  modifiedAt: true,
  name: true,
  description: true,
  private: true,
  votingStartAt: true,
  votingEndAt: true,
  allowInvalidVotes: true,
  configFrozen: true,
  pubKey: true,
  primeP: true,
  primeQ: true,
  generator: true,
});

export type SelectableElection = z.infer<typeof selectableElectionObject>;

export const selectableElectionObjectSchema = z.toJSONSchema(
  selectableElectionObject,
  toJsonSchemaParams,
);

export const updateableElectionObject = electionObject.pick({
  name: true,
  description: true,
  votingStartAt: true,
  votingEndAt: true,
  allowInvalidVotes: true,
  private: true,
});

export type UpdateableElection = z.infer<typeof updateableElectionObject>;

export const updateableElectionObjectSchema = z.toJSONSchema(
  updateableElectionObject,
  toJsonSchemaParams,
);
