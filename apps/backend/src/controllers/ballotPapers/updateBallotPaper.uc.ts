import {
  response400Object,
  type BallotPaper,
  type Response400,
  type SelectableBallotPaper,
  type UpdateableBallotPaper,
} from '@repo/votura-validators';
import type { Request, Response } from 'express';
import { HttpStatusCode } from '../../httpStatusCode.js';
import { updateBallotPaper as updatePersistentBallotPaper } from '../../services/ballotPapers.service.js';
import { validateUpdateableBallotPaper } from '../.bodyChecks/ballotPaperChecks/updatableBallotPaper.check.js';
import { isBodyCheckValidationError } from '../.bodyChecks/bodyCheckValidationError.js';

export const updateBallotPaper = async (
  req: Request<{ ballotPaperId: BallotPaper['id'] }>,
  res: Response<SelectableBallotPaper | Response400>,
): Promise<void> => {
  const validationResult = await validateUpdateableBallotPaper(req.body, req.params.ballotPaperId);
  if (isBodyCheckValidationError(validationResult)) {
    res
      .status(validationResult.status)
      .json(response400Object.parse({ message: validationResult.message }));
    return;
  }

  // If we reach this point, the request body is valid
  const updateableBallotPaper: UpdateableBallotPaper = validationResult;

  const selectableBallotPaper = await updatePersistentBallotPaper(
    updateableBallotPaper,
    req.params.ballotPaperId,
  );
  res.status(HttpStatusCode.ok).json(selectableBallotPaper);
};
