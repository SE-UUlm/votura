import {
  response400Object,
  response404Object,
  response500Object,
  updateableCandidateOperationOptions,
  type BallotPaperSection,
  type Election,
  type Response400,
  type SelectableBallotPaperSection,
  type UpdateableBallotPaperSectionCandidate,
} from '@repo/votura-validators';
import type { Request, Response } from 'express';
import { HttpStatusCode } from '../../httpStatusCode.js';
import {
  addCandidateToBallotPaperSection as addPersistentCandidateToBallotPaperSection,
  removeCandidateFromBallotPaperSection as removePersistentCandidateFromBallotPaperSection,
} from '../../services/ballotPaperSections.service.js';
import { validateUpdateableBallotPaperSectionCandidate } from '../.bodyChecks/ballotPaperSectionChecks.js';
import { isBodyCheckValidationError } from '../.bodyChecks/bodyCheckValidationError.js';

export const updateCandidateInBallotPaperSection = async (
  req: Request<{
    electionId: Election['id'];
    ballotPaperSectionId: BallotPaperSection['id'];
  }>,
  res: Response<SelectableBallotPaperSection | Response400>,
): Promise<void> => {
  const validationResult = await validateUpdateableBallotPaperSectionCandidate(
    req.body,
    req.params.electionId,
    req.params.ballotPaperSectionId,
  );

  if (isBodyCheckValidationError(validationResult)) {
    switch (validationResult.status) {
      case HttpStatusCode.badRequest:
        res
          .status(HttpStatusCode.badRequest)
          .json(response400Object.parse({ message: validationResult.message }));
        break;
      case HttpStatusCode.notFound:
        res
          .status(HttpStatusCode.notFound)
          .json(response404Object.parse({ message: validationResult.message }));
        break;
      default:
        res
          .status(HttpStatusCode.internalServerError)
          .json(response500Object.parse({ message: undefined }));
    }
    return;
  }

  // If we reach this point, the request body is valid
  const updateableBallotPaperSectionCandidate: UpdateableBallotPaperSectionCandidate =
    validationResult;

  // Proceed with adding / removing the candidate to / from the ballot paper section
  let result: SelectableBallotPaperSection | null = null;
  if (
    updateableBallotPaperSectionCandidate.operation === updateableCandidateOperationOptions.remove
  ) {
    result = await removePersistentCandidateFromBallotPaperSection(
      req.params.ballotPaperSectionId,
      updateableBallotPaperSectionCandidate.candidateId,
    );
  } else {
    result = await addPersistentCandidateToBallotPaperSection(
      req.params.ballotPaperSectionId,
      updateableBallotPaperSectionCandidate.candidateId,
    );
  }
  res.status(HttpStatusCode.ok).json(result);
};
