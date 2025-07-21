import { Router } from 'express';
import {
  createVoterGroup,
  getSpecificVoterGroup,
  getVoterGroups,
  updateVoterGroup,
  deleteVoterGroup,
} from '../controllers/voterGroups.controllers.js';
import { acceptBodyCheck } from '../middlewares/acceptBodyCheck.js';
import { acceptHeaderCheck } from '../middlewares/acceptHeaderCheck.js';
import {
  checkVoterGroupElectionsNotFrozen,
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
  '/:voterGroupId',
  acceptHeaderCheck(MimeType.applicationJson),
  acceptBodyCheck(MimeType.applicationJson),
  ...defaultVoterGroupChecks,
  checkVoterGroupElectionsNotFrozen,
  updateVoterGroup,
);
voterGroupsRouter.get(
  '/:voterGroupId',
  acceptHeaderCheck(MimeType.applicationJson),
  ...defaultVoterGroupChecks,
  getSpecificVoterGroup,
);
voterGroupsRouter.delete(
  '/:voterGroupId',
  acceptHeaderCheck(MimeType.applicationJson),
  ...defaultVoterGroupChecks,
  checkVoterGroupElectionsNotFrozen,
  deleteVoterGroup,
)
