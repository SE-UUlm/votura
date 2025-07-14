import { parameter } from '@repo/votura-validators';
import { Router } from 'express';
import {
  createBallotPaper,
  deleteBallotPaper,
  getBallotPaper,
  getBallotPapers,
  updateBallotPaper,
} from '../controllers/ballotPapers.controllers.js';
import {
  createBallotPaperSection,
  deleteBallotPaperSection,
  getBallotPaperSection,
  getBallotPaperSections,
  updateBallotPaperSection,
} from '../controllers/ballotPaperSections.controllers.js';
import {
  createCandidate,
  deleteCandidate,
  getCandidate,
  getCandidates,
  updateCandidate,
} from '../controllers/candidates.controller.js';
import {
  createElection,
  deleteElection,
  freezeElection,
  getElection,
  getElections,
  unfreezeElection,
  updateElection,
} from '../controllers/elections.controllers.js';
import { acceptBodyCheck } from '../middlewares/acceptBodyCheck.js';
import { acceptHeaderCheck } from '../middlewares/acceptHeaderCheck.js';
import { maxVotesCheckFor, RequestTypeMaxVotesCheck } from '../middlewares/maxVotesCheckFor.js';
import { defaultBallotPaperChecks } from '../middlewares/pathParamChecks/ballotPaperChecks.js';
import { defaultBallotPaperSectionChecks } from '../middlewares/pathParamChecks/ballotPaperSectionChecks.js';
import { defaultCandidateChecks } from '../middlewares/pathParamChecks/candidateChecks.js';
import {
  checkElectionNotFrozen,
  defaultElectionChecks,
} from '../middlewares/pathParamChecks/electionChecks.js';
import { MimeType } from '../middlewares/utils.js';

export const electionsRouter: Router = Router();

// Elections routes
electionsRouter.post(
  '/',
  acceptHeaderCheck(MimeType.applicationJson),
  acceptBodyCheck(MimeType.applicationJson),
  createElection,
);
electionsRouter.get('/', acceptHeaderCheck(MimeType.applicationJson), getElections);
electionsRouter.get(
  `/:${parameter.electionId}`,
  acceptHeaderCheck(MimeType.applicationJson),
  ...defaultElectionChecks,
  getElection,
);
electionsRouter.put(
  `/:${parameter.electionId}`,
  acceptHeaderCheck(MimeType.applicationJson),
  acceptBodyCheck(MimeType.applicationJson),
  ...defaultElectionChecks,
  checkElectionNotFrozen,
  updateElection,
);
electionsRouter.put(
  `/:${parameter.electionId}/freeze`,
  acceptHeaderCheck(MimeType.applicationJson),
  ...defaultElectionChecks,
  checkElectionNotFrozen,
  freezeElection,
);
electionsRouter.put(
  `/:${parameter.electionId}/unfreeze`,
  acceptHeaderCheck(MimeType.applicationJson),
  ...defaultElectionChecks,
  unfreezeElection,
);

// Ballot Papers routes
electionsRouter.delete(
  `/:${parameter.electionId}`,
  acceptHeaderCheck(MimeType.applicationJson),
  ...defaultElectionChecks,
  checkElectionNotFrozen,
  deleteElection,
);

electionsRouter.post(
  `/:${parameter.electionId}/ballotPapers`,
  acceptHeaderCheck(MimeType.applicationJson),
  acceptBodyCheck(MimeType.applicationJson),
  ...defaultElectionChecks,
  checkElectionNotFrozen,
  createBallotPaper,
);
electionsRouter.get(
  `/:${parameter.electionId}/ballotPapers`,
  acceptHeaderCheck(MimeType.applicationJson),
  ...defaultElectionChecks,
  getBallotPapers,
);
electionsRouter.put(
  `/:${parameter.electionId}/ballotPapers/:${parameter.ballotPaperId}`,
  acceptHeaderCheck(MimeType.applicationJson),
  acceptBodyCheck(MimeType.applicationJson),
  ...defaultElectionChecks,
  checkElectionNotFrozen,
  ...defaultBallotPaperChecks,
  maxVotesCheckFor(RequestTypeMaxVotesCheck.ballotPaperUpdate),
  updateBallotPaper,
);
electionsRouter.get(
  `/:${parameter.electionId}/ballotPapers/:${parameter.ballotPaperId}`,
  acceptHeaderCheck(MimeType.applicationJson),
  ...defaultElectionChecks,
  ...defaultBallotPaperChecks,
  getBallotPaper,
);
electionsRouter.delete(
  `/:${parameter.electionId}/ballotPapers/:${parameter.ballotPaperId}`,
  acceptHeaderCheck(MimeType.applicationJson),
  ...defaultElectionChecks,
  checkElectionNotFrozen,
  ...defaultBallotPaperChecks,
  deleteBallotPaper,
);

// Ballot paper section
electionsRouter.post(
  `/:${parameter.electionId}/ballotPapers/:${parameter.ballotPaperId}/ballotPaperSections`,
  acceptHeaderCheck(MimeType.applicationJson),
  acceptBodyCheck(MimeType.applicationJson),
  ...defaultElectionChecks,
  checkElectionNotFrozen,
  ...defaultBallotPaperChecks,
  maxVotesCheckFor(RequestTypeMaxVotesCheck.ballotPaperSectionCreate),
  createBallotPaperSection,
);
electionsRouter.get(
  `/:${parameter.electionId}/ballotPapers/:${parameter.ballotPaperId}/ballotPaperSections`,
  acceptHeaderCheck(MimeType.applicationJson),
  ...defaultElectionChecks,
  ...defaultBallotPaperChecks,
  getBallotPaperSections,
);
electionsRouter.put(
  `/:${parameter.electionId}/ballotPapers/:${parameter.ballotPaperId}/ballotPaperSections/:${parameter.ballotPaperSectionId}`,
  acceptHeaderCheck(MimeType.applicationJson),
  acceptBodyCheck(MimeType.applicationJson),
  ...defaultElectionChecks,
  checkElectionNotFrozen,
  ...defaultBallotPaperChecks,
  ...defaultBallotPaperSectionChecks,
  maxVotesCheckFor(RequestTypeMaxVotesCheck.ballotPaperSectionUpdate),
  updateBallotPaperSection,
);
electionsRouter.get(
  `/:${parameter.electionId}/ballotPapers/:${parameter.ballotPaperId}/ballotPaperSections/:${parameter.ballotPaperSectionId}`,
  acceptHeaderCheck(MimeType.applicationJson),
  ...defaultElectionChecks,
  ...defaultBallotPaperChecks,
  ...defaultBallotPaperSectionChecks,
  getBallotPaperSection,
);
electionsRouter.delete(
  `/:${parameter.electionId}/ballotPapers/:${parameter.ballotPaperId}/ballotPaperSections/:${parameter.ballotPaperSectionId}`,
  acceptHeaderCheck(MimeType.applicationJson),
  ...defaultElectionChecks,
  checkElectionNotFrozen,
  ...defaultBallotPaperChecks,
  ...defaultBallotPaperSectionChecks,
  deleteBallotPaperSection,
);

// Candidates
electionsRouter.post(
  `/:${parameter.electionId}/candidates`,
  acceptHeaderCheck(MimeType.applicationJson),
  acceptBodyCheck(MimeType.applicationJson),
  ...defaultElectionChecks,
  checkElectionNotFrozen,
  createCandidate,
);
electionsRouter.get(
  `/:${parameter.electionId}/candidates`,
  acceptHeaderCheck(MimeType.applicationJson),
  ...defaultElectionChecks,
  getCandidates,
);
electionsRouter.get(
  `/:${parameter.electionId}/candidates/:${parameter.candidateId}`,
  acceptHeaderCheck(MimeType.applicationJson),
  ...defaultElectionChecks,
  ...defaultCandidateChecks,
  getCandidate,
);
electionsRouter.put(
  `/:${parameter.electionId}/candidates/:${parameter.candidateId}`,
  acceptHeaderCheck(MimeType.applicationJson),
  acceptBodyCheck(MimeType.applicationJson),
  ...defaultElectionChecks,
  checkElectionNotFrozen,
  ...defaultCandidateChecks,
  updateCandidate,
);
electionsRouter.delete(
  `/:${parameter.electionId}/candidates/:${parameter.candidateId}`,
  acceptHeaderCheck(MimeType.applicationJson),
  ...defaultElectionChecks,
  checkElectionNotFrozen,
  ...defaultCandidateChecks,
  deleteCandidate,
);
