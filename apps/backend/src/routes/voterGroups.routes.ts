import { parameter } from '@repo/votura-validators';
import { Router } from 'express';
import { createVoterGroup } from '../controllers/voterGroups/createVoterGroup.uc.js';
import { createVoterTokens } from '../controllers/voterGroups/createVoterTokens.uc.js';
import { deleteVoterGroup } from '../controllers/voterGroups/deleteVoterGroup.uc.js';
import { getSpecificVoterGroup } from '../controllers/voterGroups/getSpecificVoterGroup.uc.js';
import { getVoterGroups } from '../controllers/voterGroups/getVoterGroups.uc.js';
import { updateVoterGroup } from '../controllers/voterGroups/updateVoterGroup.uc.js';
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
