import { z } from 'zod/v4';
import { voturaMetadataRegistry } from '../voturaMetadateRegistry.js';

export const IdentifiableObject = z.object({
  id: z.uuidv4().register(voturaMetadataRegistry, {
    description: 'The unique identifier of the object',
    examples: ['123e4567-e89b-12d3-a456-426614174000'],
  }),
});
