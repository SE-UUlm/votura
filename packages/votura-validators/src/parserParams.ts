import type { z } from 'zod/v4';
import { voturaMetadataRegistry } from './voturaMetadateRegistry.js';

export const toJsonSchemaParams: Parameters<typeof z.toJSONSchema>[1] = {
  metadata: voturaMetadataRegistry,
  unrepresentable: 'any',
};
