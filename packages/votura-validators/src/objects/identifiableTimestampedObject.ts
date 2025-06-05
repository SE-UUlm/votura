import { z } from 'zod/v4';
import { IdentifiableObject } from './identifiableObject.js';
import { TimestampedObject } from './timestampedObject.js';

export const IdentifiableTimestampedObject = z.object({
  ...IdentifiableObject.shape,
  ...TimestampedObject.shape,
});
