import { Parameter } from '@repo/votura-validators';
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
import { ballotPaperIdCheck, electionIdCheck } from '../middlewares/pathParameterCheck.js';
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
  `/:${Parameter.electionId}`,
  acceptHeaderCheck(MimeType.ApplicationJson),
  electionIdCheck,
  getElection,
);
electionsRouter.put(
  `/:${Parameter.electionId}`,
  acceptHeaderCheck(MimeType.ApplicationJson),
  acceptBodyCheck(MimeType.ApplicationJson),
  electionIdCheck,
  updateElection,
);

electionsRouter.post(
  `/:${Parameter.electionId}/ballotPapers`,
  acceptHeaderCheck(MimeType.ApplicationJson),
  acceptBodyCheck(MimeType.ApplicationJson),
  electionIdCheck,
  createBallotPaper,
);
electionsRouter.get(
  `/:${Parameter.electionId}/ballotPapers`,
  acceptHeaderCheck(MimeType.ApplicationJson),
  electionIdCheck,
  getBallotPapers,
);
electionsRouter.put(
  `/:${Parameter.electionId}/ballotPapers/:${Parameter.ballotPaperId}`,
  acceptHeaderCheck(MimeType.ApplicationJson),
  acceptBodyCheck(MimeType.ApplicationJson),
  electionIdCheck,
  ballotPaperIdCheck,
  updateBallotPaper,
);
electionsRouter.get(
  `/:${Parameter.electionId}/ballotPapers/:${Parameter.ballotPaperId}`,
  acceptHeaderCheck(MimeType.ApplicationJson),
  electionIdCheck,
  ballotPaperIdCheck,
  getBallotPaper,
);
electionsRouter.delete(
  `/:${Parameter.electionId}/ballotPapers/:${Parameter.ballotPaperId}`,
  acceptHeaderCheck(MimeType.ApplicationJson),
  electionIdCheck,
  ballotPaperIdCheck,
  deleteBallotPaper,
);
