import { Router } from 'express';
import { getElectionsForVoting } from '../controllers/voting.controllers.js';
import { acceptHeaderCheck } from '../middlewares/acceptHeaderCheck.js';
import { MimeType } from '../middlewares/utils.js';

export const votingRouter: Router = Router();

votingRouter.get(
  '/getElections',
  acceptHeaderCheck(MimeType.applicationJson),
  getElectionsForVoting,
);
