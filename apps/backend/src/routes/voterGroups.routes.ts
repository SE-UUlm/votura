import { parameter } from '@repo/votura-validators';
import { Router } from 'express';
import {
  createVoterGroup,
  createVoterTokens,
  deleteVoterGroup,
  getSpecificVoterGroup,
  getVoterGroups,
  updateVoterGroup,
} from '../controllers/voterGroups.controllers.js';
import { acceptBodyCheck } from '../middlewares/acceptBodyCheck.js';
import { acceptHeaderCheck } from '../middlewares/acceptHeaderCheck.js';
import {
  checkVoterGroupElectionsNotFrozen,
  checkVoterTokensMayBeCreated,
  defaultVoterGroupChecks,
} from '../middlewares/pathParamChecks/voterGroupChecks.js';
import { MimeType } from '../middlewares/utils.js';

export const voterGroupsRouter: Router = Router();

voterGroupsRouter.post(
  '/',
  acceptHeaderCheck(MimeType.applicationJson),
  acceptBodyCheck(MimeType.applicationJson),
  createVoterGroup,
);
voterGroupsRouter.get('/', acceptHeaderCheck(MimeType.applicationJson), getVoterGroups);
voterGroupsRouter.put(
  `/:${parameter.voterGroupId}`,
  acceptHeaderCheck(MimeType.applicationJson),
  acceptBodyCheck(MimeType.applicationJson),
  ...defaultVoterGroupChecks,
  checkVoterGroupElectionsNotFrozen,
  updateVoterGroup,
);
voterGroupsRouter.get(
  `/:${parameter.voterGroupId}`,
  acceptHeaderCheck(MimeType.applicationJson),
  ...defaultVoterGroupChecks,
  getSpecificVoterGroup,
);
voterGroupsRouter.delete(
  `/:${parameter.voterGroupId}`,
  acceptHeaderCheck(MimeType.applicationJson),
  ...defaultVoterGroupChecks,
  checkVoterGroupElectionsNotFrozen,
  deleteVoterGroup,
);
voterGroupsRouter.get(
  `/:${parameter.voterGroupId}/createVoterTokens`,
  acceptHeaderCheck(MimeType.applicationJson),
  ...defaultVoterGroupChecks,
  checkVoterTokensMayBeCreated,
  createVoterTokens,
);
