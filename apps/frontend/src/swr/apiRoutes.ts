import type { SelectableBallotPaper, SelectableElection } from '@repo/votura-validators';

export const apiRoutes = {
  base: import.meta.env.VITE_API_BASE_URL as string,
  elections: {
    base: '/elections',
    byId: (id: SelectableElection['id']): string => `/elections/${id}`,
    ballotPapers: {
      base: (id: SelectableElection['id']): string => `/elections/${id}/ballotPapers`,
      byId: (
        electionId: SelectableElection['id'],
        ballotPaperId: SelectableBallotPaper['id'],
      ): string => `/elections/${electionId}/ballotPapers/${ballotPaperId}`,
    },
  },
  users: {
    base: '/users',
    login: '/users/login',
    logout: '/users/logout',
    refreshTokens: '/users/refreshTokens',
  },
};
