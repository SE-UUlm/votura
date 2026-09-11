import type {
  SelectableBallotPaper,
  SelectableBallotPaperSection,
  SelectableCandidate,
  SelectableElection,
  SelectableUser,
  SelectableVoterGroup,
} from '@repo/votura-validators';

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
      ballotPaperSections: {
        base: (
          electionId: SelectableElection['id'],
          ballotPaperId: SelectableBallotPaper['id'],
        ): string => `/elections/${electionId}/ballotPapers/${ballotPaperId}/ballotPaperSections`,
        byId: (
          electionId: SelectableElection['id'],
          ballotPaperId: SelectableBallotPaper['id'],
          ballotPaperSectionId: SelectableBallotPaperSection['id'],
        ): string =>
          `/elections/${electionId}/ballotPapers/${ballotPaperId}/ballotPaperSections/${ballotPaperSectionId}`,
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
  voterGroups: {
    base: '/voterGroups',
    byId: (id: SelectableVoterGroup['id']): string => `/voterGroups/${id}`,
    createVoterTokens: (id: SelectableVoterGroup['id']): string =>
      `/voterGroups/${id}/createVoterTokens`,
  },
  users: {
    count: '/users/count',
    all: '/users',
    create: '/users',
    byId: (id: SelectableUser['id']): string => `/users/${id}`,
    editById: (id: SelectableUser['id']): string => `/users/${id}`,
    deleteById: (id: SelectableUser['id']): string => `/users/${id}`,
    setInitialPassword: '/users/setInitialPassword',
    login: '/users/login',
    logout: '/users/logout',
    refreshTokens: '/users/refreshTokens',
    changePassword: '/users/changePassword',
  },
};
