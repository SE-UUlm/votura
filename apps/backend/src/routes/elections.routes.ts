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
  getElection,
  getElections,
  updateElection,
} from '../controllers/elections.controllers.js';
import { acceptBodyCheck } from '../middlewares/acceptBodyCheck.js';
import { acceptHeaderCheck } from '../middlewares/acceptHeaderCheck.js';
import {
  checkElectionNotFrozen,
  defaultElectionChecks,
} from '../middlewares/pathParamChecks/electionCheck.js';
import { ballotPaperIdCheck } from '../middlewares/pathParameterCheck.js';
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
  ballotPaperIdCheck,
  updateBallotPaper,
);
electionsRouter.get(
  `/:${parameter.electionId}/ballotPapers/:${parameter.ballotPaperId}`,
  acceptHeaderCheck(MimeType.ApplicationJson),
  ...defaultElectionChecks,
  ballotPaperIdCheck,
  getBallotPaper,
);
electionsRouter.delete(
  `/:${parameter.electionId}/ballotPapers/:${parameter.ballotPaperId}`,
  acceptHeaderCheck(MimeType.ApplicationJson),
  ...defaultElectionChecks,
  checkElectionNotFrozen,
  ballotPaperIdCheck,
  deleteBallotPaper,
);
