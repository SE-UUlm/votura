import type { SelectableElection } from '@repo/votura-validators';
import { backendBaseUrl } from '../runtimeConfig.js';

export const rpcRoutes = {
  base: backendBaseUrl,
  elections: {
    freezable: (id: SelectableElection['id']): string => `/elections/${id}/freezable`,
    freeze: (id: SelectableElection['id']): string => `/elections/${id}/freeze`,
    unfreeze: (id: SelectableElection['id']): string => `/elections/${id}/unfreeze`,
  },
};
