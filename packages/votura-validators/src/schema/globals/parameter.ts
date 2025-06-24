export const Parameter = {
  electionId: 'electionId',
  ballotPaperId: 'ballotPaperId',
  ballotPaperSectionId: 'ballotPaperSectionId',
  candidateId: 'candidateId',
  voterGroupId: 'voterGroupId',
} as const

type Parameter = typeof Parameter[keyof typeof Parameter];