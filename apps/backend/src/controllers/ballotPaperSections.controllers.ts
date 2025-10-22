import {
  response400Object,
  response404Object,
  response500Object,
  updateableCandidateOperationOptions,
  type BallotPaper,
  type BallotPaperSection,
  type Election,
  type InsertableBallotPaperSection,
  type Response400,
  type Response404,
  type SelectableBallotPaperSection,
  type UpdateableBallotPaperSection,
  type UpdateableBallotPaperSectionCandidate,
} from '@repo/votura-validators';
import type { Request, Response } from 'express';
import { HttpStatusCode } from '../httpStatusCode.js';
import {
  addCandidateToBallotPaperSection as addPersistentCandidateToBallotPaperSection,
  createBallotPaperSection as createPersistentBallotPaperSection,
  deleteBallotPaperSection as deletePersistentBallotPaperSection,
  getBallotPaperSection as getPersistentBallotPaperSection,
  getBallotPaperSections as getPersistentBallotPaperSections,
  removeCandidateFromBallotPaperSection as removePersistentCandidateFromBallotPaperSection,
  updateBallotPaperSection as updatePersistentBallotPaperSection,
} from '../services/ballotPaperSections.service.js';
import {
  validateInsertableBallotPaperSection,
  validateUpdateableBallotPaperSection,
  validateUpdateableBallotPaperSectionCandidate,
} from './bodyChecks/ballotPaperSectionChecks.js';
import { isBodyCheckValidationError } from './bodyChecks/bodyCheckValidationError.js';

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

export const getBallotPaperSections = async (
  req: Request<{ ballotPaperId: BallotPaper['id'] }>,
  res: Response<SelectableBallotPaperSection[]>,
): Promise<void> => {
  const ballotPaperSections = await getPersistentBallotPaperSections(req.params.ballotPaperId);
  res.status(HttpStatusCode.ok).json(ballotPaperSections);
};

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

export const getBallotPaperSection = async (
  req: Request<{ ballotPaperSectionId: BallotPaperSection['id'] }>,
  res: Response<SelectableBallotPaperSection>,
): Promise<void> => {
  const ballotPaperSection = await getPersistentBallotPaperSection(req.params.ballotPaperSectionId);
  res.status(HttpStatusCode.ok).json(ballotPaperSection);
};

export const deleteBallotPaperSection = async (
  req: Request<{ ballotPaperSectionId: BallotPaperSection['id'] }>,
  res: Response<Response404>,
): Promise<void> => {
  const result = await deletePersistentBallotPaperSection(req.params.ballotPaperSectionId);
  if (result.numDeletedRows < 1n) {
    res
      .status(HttpStatusCode.notFound)
      .json(response404Object.parse({ message: "Can't find ballot paper section." }));
    return;
  }
  res.sendStatus(HttpStatusCode.noContent);
};

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
