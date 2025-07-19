import { z } from 'zod/v4';
import { identifiableObject } from './identifiableObject.js';
import { timestampedObject } from './timestampedObject.js';

export const identifiableTimestampedObject = z.object({
  ...identifiableObject.shape,
  ...timestampedObject.shape,
});
