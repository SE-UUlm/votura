import {
  insertableBallotPaperObject,
  insertableElectionObject,
  insertableUserObject,
} from '@repo/votura-validators';

export const DEMO_TOKEN = '1234';
const STRONG_PWD = 'MyStrong!Password123';
export const demoUser = insertableUserObject.parse({
  email: 'user@votura.org',
  password: STRONG_PWD,
});
export const demoUser2 = insertableUserObject.parse({
  email: 'user2@votura.org',
  password: STRONG_PWD,
});

export const demoElection = insertableElectionObject.parse({
  name: 'My test election',
  private: true,
  votingStartAt: '2025-06-16T14:30:00Z',
  votingEndAt: '2025-06-18T14:30:00Z',
  allowInvalidVotes: false,
});
export const demoElection2 = insertableElectionObject.parse({
  name: 'My test election 2',
  description: 'My test election description 2',
  private: true,
  votingStartAt: '2026-06-16T14:30:00Z',
  votingEndAt: '2026-06-18T14:30:00Z',
  allowInvalidVotes: false,
});

export const demoBallotPaper = insertableBallotPaperObject.parse({
  name: 'Test ballot paper',
  description: 'Test ballot paper description',
  maxVotes: 5,
  maxVotesPerCandidate: 3,
});
