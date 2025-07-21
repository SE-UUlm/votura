import { Router } from 'express';
import { createVoterGroup, getVoterGroups } from '../controllers/voterGroups.controllers.js';
import { acceptBodyCheck } from '../middlewares/acceptBodyCheck.js';
import { acceptHeaderCheck } from '../middlewares/acceptHeaderCheck.js';
import { MimeType } from '../middlewares/utils.js';

export const voterGroupsRouter: Router = Router();

voterGroupsRouter.post(
  '/',
  acceptHeaderCheck(MimeType.applicationJson),
  acceptBodyCheck(MimeType.applicationJson),
  createVoterGroup,
);
voterGroupsRouter.get('/', acceptHeaderCheck(MimeType.applicationJson), getVoterGroups);
