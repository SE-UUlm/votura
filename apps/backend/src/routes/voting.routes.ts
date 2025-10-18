import { Router } from 'express';
import { castVote, getElectionsForVoting } from '../controllers/voting.controllers.js';
import { acceptBodyCheck } from '../middlewares/acceptBodyCheck.js';
import { acceptHeaderCheck } from '../middlewares/acceptHeaderCheck.js';
import { MimeType } from '../middlewares/utils.js';

export const votingRouter: Router = Router();

votingRouter.get(
  '/getElections',
  acceptHeaderCheck(MimeType.applicationJson),
  getElectionsForVoting,
);
votingRouter.post(
  '/castVote',
  acceptHeaderCheck(MimeType.applicationJson),
  acceptBodyCheck(MimeType.applicationJson),
  castVote,
);
