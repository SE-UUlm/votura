export const parameter = {
  electionId: 'electionId',
  ballotPaperId: 'ballotPaperId',
  ballotPaperSectionId: 'ballotPaperSectionId',
  candidateId: 'candidateId',
  voterGroupId: 'voterGroupId',
} as const;

type Parameter = (typeof parameter)[keyof typeof parameter];
