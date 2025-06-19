import { z } from 'zod/v4';
import { voturaMetadataRegistry } from '../voturaMetadateRegistry.js';
import { toJsonSchemaParams } from '../parserParams.js';

export const uuidObject = z.uuidv4().register(voturaMetadataRegistry, {
  description: 'The unique identifier of the object',
  example: '123e4567-e89b-12d3-a456-426614174000',
});

export type Uuid = z.infer<typeof uuidObject>;

export const uuidObjectSchema = z.toJSONSchema(uuidObject, toJsonSchemaParams);

export const identifiableObject = z.object({
  id: uuidObject,
});
