import type {
  SelectableBallotPaper,
  SelectableBallotPaperSection,
  SelectableCandidate,
  SelectableElection,
} from '@repo/votura-validators';

export const apiRoutes = {
  base: import.meta.env.VITE_API_BASE_URL as string,
  elections: {
    base: '/elections',
    byId: (id: SelectableElection['id']): string => `/elections/${id}`,
    freezable: (id: SelectableElection['id']): string => `/elections/${id}/freezable`,
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
        candidates: {
          base: (
            electionId: SelectableElection['id'],
            ballotPaperId: SelectableBallotPaper['id'],
            ballotPaperSectionId: SelectableBallotPaperSection['id'],
          ): string =>
            `/elections/${electionId}/ballotPapers/${ballotPaperId}/ballotPaperSections/${ballotPaperSectionId}/candidates`,
        },
      },
    },
    candidates: {
      base: (id: SelectableElection['id']): string => `/elections/${id}/candidates`,
      byId: (
        electionId: SelectableElection['id'],
        candidateId: SelectableCandidate['id'],
      ): string => `/elections/${electionId}/candidates/${candidateId}`,
    },
  },
  users: {
    base: '/users',
    login: '/users/login',
    logout: '/users/logout',
    refreshTokens: '/users/refreshTokens',
  },
};
