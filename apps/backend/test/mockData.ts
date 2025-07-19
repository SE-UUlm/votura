import {
  insertableBallotPaperObject,
  insertableBallotPaperSectionObject,
  insertableCandidateObject,
  insertableElectionObject,
  insertableUserObject,
  insertableVoterGroupObject,
} from '@repo/votura-validators';

/*
 * User and authentication
 */
const STRONG_PWD = 'MyStrong!Password123';
export const demoUser = insertableUserObject.parse({
  email: 'user@votura.org',
  password: STRONG_PWD,
});
export const demoUser2 = insertableUserObject.parse({
  email: 'user2@votura.org',
  password: STRONG_PWD,
});

/*
 * Elections
 */
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

/*
 * Ballot papers
 */
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

/*
 * Ballot paper sections
 */
export const demoBallotPaperSection = insertableBallotPaperSectionObject.parse({
  name: 'Test ballot paper section',
  description: 'Test ballot paper section description',
  maxVotes: 4,
  maxVotesPerCandidate: 2,
});
export const demoBallotPaperSection2 = insertableBallotPaperSectionObject.parse({
  name: 'Test ballot paper section 2',
  description: 'Test ballot paper section description 2',
  maxVotes: 3,
  maxVotesPerCandidate: 1,
});
export const brokenBallotPaperSection = {
  xxx: 'Test broken ballot paper section',
  description: 'Test broken ballot paper section description',
  maxVotesPerCandidate: 20,
};

/*
 * Candidates
 */
export const demoCandidate = insertableCandidateObject.parse({
  title: 'Test candidate',
  description: 'Test candidate description',
});
export const demoCandidate2 = insertableCandidateObject.parse({
  title: 'Test candidate 2',
  description: 'Test candidate description 2',
});
export const brokenCandidate = {
  title: '',
  description: 'Broken candidate description',
};

/*
 * Voter groups
 */
export const voterGroupNoBallotPapers = insertableVoterGroupObject.parse({
  name: 'Test Voter Group',
  description: 'Test Voter Group description',
  numberOfVoters: 10,
  ballotPapers: [],
});
