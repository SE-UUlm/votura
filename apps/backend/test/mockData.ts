import {
  insertableBallotPaperObject,
  insertableBallotPaperSectionObject,
  insertableElectionObject,
  insertableUserObject,
} from '@repo/votura-validators';

// User and authentication
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

// Elections
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
export const brokenElection = {
  name: 'My broken election',
  private: 123,
  votingStartAt: '2025-06-18T14:30:00Z',
  votingEndAt: '2025-06-16T14:30:00Z',
  allowInvalidVotes: 'false',
};

// Ballot papers
export const demoBallotPaper = insertableBallotPaperObject.parse({
  name: 'Test ballot paper',
  description: 'Test ballot paper description',
  maxVotes: 5,
  maxVotesPerCandidate: 3,
});
export const demoBallotPaper2 = insertableBallotPaperObject.parse({
  name: 'Test ballot paper 2',
  description: 'Test ballot paper description 2',
  maxVotes: 6,
  maxVotesPerCandidate: 2,
});
export const brokenDemoBallotPaper = {
  name: 'Broken ballot paper',
  maxVotes: 6,
  maxVotesPerCandidate: 7,
};

// Ballot paper sections
export const demoBallotPaperSection = insertableBallotPaperSectionObject.parse({
  name: 'Test ballot paper section',
  description: 'Test ballot paper section description',
  maxVotes: 30,
  maxVotesPerCandidate: 20,
});
export const brokenBallotPaperSection = {
  XYZ: 'Test broken ballot paper section',
  description: 'Test broken ballot paper section description',
  maxVotesPerCandidate: 20,
};
