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
  getBallotPaperSections,
} from '../controllers/ballotPaperSections.controllers.js';
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
import { defaultBallotPaperChecks } from '../middlewares/pathParamChecks/ballotPaperChecks.js';
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
  createBallotPaperSection,
);
electionsRouter.get(
  `/:${parameter.electionId}/ballotPapers/:${parameter.ballotPaperId}/ballotPaperSections`,
  acceptHeaderCheck(MimeType.applicationJson),
  ...defaultElectionChecks,
  ...defaultBallotPaperChecks,
  getBallotPaperSections,
);
