import {
  response400Object,
  type BallotPaper,
  type BallotPaperSection,
  type Response400,
  type SelectableBallotPaperSection,
  type UpdateableBallotPaperSection,
} from '@repo/votura-validators';
import type { Request, Response } from 'express';
import { HttpStatusCode } from '../../httpStatusCode.js';
import { updateBallotPaperSection as updatePersistentBallotPaperSection } from '../../services/ballotPaperSections.service.js';
import { validateUpdateableBallotPaperSection } from '../.bodyChecks/ballotPaperSectionChecks.js';
import { isBodyCheckValidationError } from '../.bodyChecks/bodyCheckValidationError.js';

export const updateBallotPaperSection = async (
  req: Request<{
    ballotPaperId: BallotPaper['id'];
    ballotPaperSectionId: BallotPaperSection['id'];
  }>,
  res: Response<SelectableBallotPaperSection | Response400>,
): Promise<void> => {
  const validationResult = await validateUpdateableBallotPaperSection(
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
  const updateableBallotPaperSection: UpdateableBallotPaperSection = validationResult;

  const selectableBallotPaperSection = await updatePersistentBallotPaperSection(
    updateableBallotPaperSection,
    req.params.ballotPaperSectionId,
  );
  res.status(HttpStatusCode.ok).json(selectableBallotPaperSection);
};
