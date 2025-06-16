import { Router } from 'express';
import { createElection } from '../controllers/elections.controllers.js';
import { acceptHeaderCheck } from '../middlewares/acceptHeaderCheck.js';
import { acceptBodyCheck } from '../middlewares/acceptBodyCheck.js';
import { MimeType } from '../middlewares/utils.js';

export const electionsRouter: Router = Router();

electionsRouter.post(
  '/',
  acceptHeaderCheck(MimeType.ApplicationJson),
  acceptBodyCheck(MimeType.ApplicationJson),
  createElection,
);
