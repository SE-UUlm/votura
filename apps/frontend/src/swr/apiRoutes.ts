import type { SelectableBallotPaper, SelectableElection } from '@repo/votura-validators';

export const apiRoutes = {
  base: import.meta.env.VITE_API_BASE_URL as string,
  elections: {
    base: '/elections',
    byId: (id: SelectableElection['id']): string => `/elections/${id}`,
    freeze: (id: SelectableElection['id']): string => `/elections/${id}/freeze`,
    unfreeze: (id: SelectableElection['id']): string => `/elections/${id}/unfreeze`,
    ballotPapers: {
      base: (id: SelectableElection['id']): string => `/elections/${id}/ballotPapers`,
      byId: (
        electionId: SelectableElection['id'],
        ballotPaperId: SelectableBallotPaper['id'],
      ): string => `/elections/${electionId}/ballotPapers/${ballotPaperId}`,
      ballotPaperSections: {
        base: (
          electionId: SelectableElection['id'],
          ballotPaperId: SelectableBallotPaper['id'],
        ): string => `/elections/${electionId}/ballotPapers/${ballotPaperId}/ballotPaperSections`,
      },
    },
  },
  users: {
    base: '/users',
    login: '/users/login',
    logout: '/users/logout',
    refreshTokens: '/users/refreshTokens',
  },
};
