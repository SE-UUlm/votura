import { parameter } from '@repo/votura-validators';
import { Router } from 'express';
import {
  createBallotPaper,
  deleteBallotPaper,
  getBallotPaper,
  getBallotPapers,
  updateBallotPaper,
} from '../controllers/ballotPapers.controllers.js';
import { createElection, getElection, getElections } from '../controllers/elections.controllers.js';
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
  `/:${parameter.electionId}`,
  acceptHeaderCheck(MimeType.ApplicationJson),
  electionIdCheck,
  getElection,
);

electionsRouter.post(
  `/:${parameter.electionId}/ballotPapers`,
  acceptHeaderCheck(MimeType.ApplicationJson),
  acceptBodyCheck(MimeType.ApplicationJson),
  electionIdCheck,
  createBallotPaper,
);
electionsRouter.get(
  `/:${parameter.electionId}/ballotPapers`,
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
