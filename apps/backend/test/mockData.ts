import { insertableBallotPaperObject, insertableElectionObject } from '@repo/votura-validators';

export const demoElection = insertableElectionObject.parse({
  name: 'My test election',
  description: 'My description',
  private: true,
  votingStartAt: '2025-06-16T14:30:00Z',
  votingEndAt: '2025-06-18T14:30:00Z',
  allowInvalidVotes: false,
});
export const demoBallotPaper = insertableBallotPaperObject.parse({
  name: 'Test BallotPaper',
  description: 'Test description',
  maxVotes: 5,
  maxVotesPerCandidate: 3,
});
