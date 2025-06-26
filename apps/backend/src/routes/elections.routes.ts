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
import { ballotPaperIdCheck, electionIdCheck } from '../middlewares/pathParameterCheck.js';
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
  electionIdCheck(false),
  getElection,
);
electionsRouter.put(
  `/:${parameter.electionId}`,
  acceptHeaderCheck(MimeType.ApplicationJson),
  acceptBodyCheck(MimeType.ApplicationJson),
  electionIdCheck(true),
  updateElection,
);
electionsRouter.put(
  `/:${parameter.electionId}/freeze`,
  acceptHeaderCheck(MimeType.ApplicationJson),
  electionIdCheck(true),
  freezeElection,
);
electionsRouter.put(
  `/:${parameter.electionId}/unfreeze`,
  acceptHeaderCheck(MimeType.ApplicationJson),
  electionIdCheck(false),
  unfreezeElection,
);

// Ballot Papers routes
electionsRouter.post(
  `/:${parameter.electionId}/ballotPapers`,
  acceptHeaderCheck(MimeType.ApplicationJson),
  acceptBodyCheck(MimeType.ApplicationJson),
  electionIdCheck(false),
  createBallotPaper,
);
electionsRouter.get(
  `/:${parameter.electionId}/ballotPapers`,
  acceptHeaderCheck(MimeType.ApplicationJson),
  electionIdCheck(false),
  getBallotPapers,
);
electionsRouter.put(
  `/:${parameter.electionId}/ballotPapers/:${parameter.ballotPaperId}`,
  acceptHeaderCheck(MimeType.ApplicationJson),
  acceptBodyCheck(MimeType.ApplicationJson),
  electionIdCheck(true),
  ballotPaperIdCheck,
  updateBallotPaper,
);
electionsRouter.get(
  `/:${parameter.electionId}/ballotPapers/:${parameter.ballotPaperId}`,
  acceptHeaderCheck(MimeType.ApplicationJson),
  electionIdCheck(false),
  ballotPaperIdCheck,
  getBallotPaper,
);
electionsRouter.delete(
  `/:${parameter.electionId}/ballotPapers/:${parameter.ballotPaperId}`,
  acceptHeaderCheck(MimeType.ApplicationJson),
  electionIdCheck(true),
  ballotPaperIdCheck,
  deleteBallotPaper,
);
