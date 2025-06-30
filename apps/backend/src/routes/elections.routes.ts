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
  getElection,
  getElections,
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

electionsRouter.post(
  '/',
  acceptHeaderCheck(MimeType.ApplicationJson),
  acceptBodyCheck(MimeType.ApplicationJson),
  createElection,
);

electionsRouter.get('/', acceptHeaderCheck(MimeType.ApplicationJson), getElections);
electionsRouter.get(
  `/:${parameter.electionId}`,
  acceptHeaderCheck(MimeType.ApplicationJson),
  ...defaultElectionChecks,
  getElection,
);
electionsRouter.put(
  `/:${parameter.electionId}`,
  acceptHeaderCheck(MimeType.ApplicationJson),
  acceptBodyCheck(MimeType.ApplicationJson),
  ...defaultElectionChecks,
  checkElectionNotFrozen,
  updateElection,
);

electionsRouter.post(
  `/:${parameter.electionId}/ballotPapers`,
  acceptHeaderCheck(MimeType.ApplicationJson),
  acceptBodyCheck(MimeType.ApplicationJson),
  ...defaultElectionChecks,
  createBallotPaper,
);
electionsRouter.get(
  `/:${parameter.electionId}/ballotPapers`,
  acceptHeaderCheck(MimeType.ApplicationJson),
  ...defaultElectionChecks,
  getBallotPapers,
);
electionsRouter.put(
  `/:${parameter.electionId}/ballotPapers/:${parameter.ballotPaperId}`,
  acceptHeaderCheck(MimeType.ApplicationJson),
  acceptBodyCheck(MimeType.ApplicationJson),
  ...defaultElectionChecks,
  checkElectionNotFrozen,
  ...defaultBallotPaperChecks,
  updateBallotPaper,
);
electionsRouter.get(
  `/:${parameter.electionId}/ballotPapers/:${parameter.ballotPaperId}`,
  acceptHeaderCheck(MimeType.ApplicationJson),
  ...defaultElectionChecks,
  ...defaultBallotPaperChecks,
  getBallotPaper,
);
electionsRouter.delete(
  `/:${parameter.electionId}/ballotPapers/:${parameter.ballotPaperId}`,
  acceptHeaderCheck(MimeType.ApplicationJson),
  ...defaultElectionChecks,
  checkElectionNotFrozen,
  ...defaultBallotPaperChecks,
  deleteBallotPaper,
);

// Ballot paper section
electionsRouter.post(
  `/:${parameter.electionId}/ballotPapers/:${parameter.ballotPaperId}/ballotPaperSections`,
  acceptHeaderCheck(MimeType.ApplicationJson),
  acceptBodyCheck(MimeType.ApplicationJson),
  ...defaultElectionChecks,
  checkElectionNotFrozen,
  ...defaultBallotPaperChecks,
  createBallotPaperSection,
);
electionsRouter.get(
  `/:${parameter.electionId}/ballotPapers/:${parameter.ballotPaperId}/ballotPaperSections`,
  acceptHeaderCheck(MimeType.ApplicationJson),
  ...defaultElectionChecks,
  ...defaultBallotPaperChecks,
  getBallotPaperSections,
);
