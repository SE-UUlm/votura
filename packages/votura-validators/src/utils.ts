import { type GlobalMeta, z } from 'zod/v4';

export const voturaMetadataRegistry = z.registry<GlobalMeta>();

export const IdentifiableObject = z.object({
  id: z.uuidv4().register(voturaMetadataRegistry, {
    description: 'The unique identifier of the object',
    examples: ['123e4567-e89b-12d3-a456-426614174000'],
  }),
});

export const TimestampedObject = z.object({
  createdAt: z.iso.datetime().register(voturaMetadataRegistry, {
    description: 'The creation date of the object.',
    examples: ['2032-10-01T00:00:00Z'],
  }),
  modifiedAt: z.iso.datetime().register(voturaMetadataRegistry, {
    description: 'The latest modification date of the object.',
    examples: ['2032-10-01T00:00:00Z'],
  }),
});

export const IdentifiableTimestampedObject = z.object({
  ...IdentifiableObject.shape,
  ...TimestampedObject.shape,
});
