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
  createElection,
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
electionsRouter.put(
  `/:${parameter.electionId}/freeze`,
  acceptHeaderCheck(MimeType.ApplicationJson),
  ...defaultElectionChecks,
  checkElectionNotFrozen,
  freezeElection,
);
electionsRouter.put(
  `/:${parameter.electionId}/unfreeze`,
  acceptHeaderCheck(MimeType.ApplicationJson),
  ...defaultElectionChecks,
  unfreezeElection,
);

// Ballot Papers routes
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
