import {
  response400Object,
  type BallotPaper,
  type InsertableBallotPaperSection,
  type Response400,
  type SelectableBallotPaperSection,
} from '@repo/votura-validators';
import type { Request, Response } from 'express';
import { HttpStatusCode } from '../../httpStatusCode.js';
import { createBallotPaperSection as createPersistentBallotPaperSection } from '../../services/ballotPaperSections.service.js';
import { validateInsertableBallotPaperSection } from '../.bodyChecks/ballotPaperSectionChecks/insertableBallotPaperSection.check.js';
import { isBodyCheckValidationError } from '../.bodyChecks/bodyCheckValidationError.js';

export const createBallotPaperSection = async (
  req: Request<{ ballotPaperId: BallotPaper['id'] }>,
  res: Response<SelectableBallotPaperSection | Response400>,
): Promise<void> => {
  const validationResult = await validateInsertableBallotPaperSection(
    req.body,
    req.params.ballotPaperId,
  );
  if (isBodyCheckValidationError(validationResult)) {
    res
      .status(validationResult.status)
      .json(response400Object.parse({ message: validationResult.message }));
    return;
  }

  // If we reach this point, the request body is valid
  const insertableBallotPaperSection: InsertableBallotPaperSection = validationResult;

  const selectableBallotPaperSection = await createPersistentBallotPaperSection(
    insertableBallotPaperSection,
    req.params.ballotPaperId,
  );
  res.status(HttpStatusCode.created).json(selectableBallotPaperSection);
};
