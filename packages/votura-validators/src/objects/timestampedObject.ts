import { z } from 'zod/v4';
import { voturaMetadataRegistry } from '../voturaMetadateRegistry.js';

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
