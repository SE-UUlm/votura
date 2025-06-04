import { type GlobalMeta, z } from 'zod/v4';

export interface VoturaMetadata extends GlobalMeta {
  example?: string;
}

export const voturaMetadataRegistry = z.registry<VoturaMetadata>();
