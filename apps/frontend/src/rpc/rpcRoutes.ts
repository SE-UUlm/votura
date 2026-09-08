import type { SelectableElection } from '@repo/votura-validators';

export const rpcRoutes = {
  base: import.meta.env.VITE_API_BASE_URL as string,
  elections: {
    freezable: (id: SelectableElection['id']): string => `/elections/${id}/freezable`,
    freeze: (id: SelectableElection['id']): string => `/elections/${id}/freeze`,
    unfreeze: (id: SelectableElection['id']): string => `/elections/${id}/unfreeze`,
  },
};
