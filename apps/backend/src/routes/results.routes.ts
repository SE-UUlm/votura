import { parameter } from '@repo/votura-validators';
import { Router } from 'express';
import { getElectionResults } from '../controllers/elections/getElectionResults.uc.js';
import { acceptHeaderCheck } from '../middlewares/acceptHeaderCheck.js';
import {
  checkElectionExists,
  checkElectionResultsPublished,
  checkElectionUuid,
} from '../middlewares/pathParamChecks/electionChecks.js';
import { MimeType } from '../middlewares/utils.js';

export const resultsRouter: Router = Router();

resultsRouter.get(
  `/:${parameter.electionId}`,
  acceptHeaderCheck(MimeType.applicationJson),
  checkElectionUuid,
  checkElectionExists,
  checkElectionResultsPublished,
  getElectionResults,
);
