import {
  insertableBallotPaperObject,
  response400Object,
  response404Object,
  zodErrorToResponse400,
  type BallotPaper,
  type Election,
  type Response400,
  type Response404,
  type SelectableBallotPaper,
  type UpdateableBallotPaper,
} from '@repo/votura-validators';
import type { Request, Response } from 'express';
import { HttpStatusCode } from '../httpStatusCode.js';
import {
  createBallotPaper as createPersistentBallotPaper,
  deleteBallotPaper as deletePersistentBallotPaper,
  getBallotPaper as getPersistentBallotPaper,
  getBallotPapers as getPersistentBallotPapers,
  updateBallotPaper as updatePersistentBallotPaper,
} from '../services/ballotPapers.service.js';
import { validateUpdateableBallotPaper } from './bodyChecks/ballotPaperChecks.js';
import { isBodyCheckValidationError } from './bodyChecks/bodyCheckValidationError.js';

export const createBallotPaper = async (
  req: Request<{ electionId: Election['id'] }>,
  res: Response<SelectableBallotPaper | Response400>,
): Promise<void> => {
  const body: unknown = req.body;
  const { data, error, success } = await insertableBallotPaperObject.safeParseAsync(body);
  if (success === false) {
    res.status(HttpStatusCode.badRequest).send(zodErrorToResponse400(error));
    return;
  }

  const selectableBallotPaper = await createPersistentBallotPaper(data, req.params.electionId);
  res.status(HttpStatusCode.created).json(selectableBallotPaper);
};

export const getBallotPapers = async (
  req: Request<{ electionId: Election['id'] }>,
  res: Response<SelectableBallotPaper[]>,
): Promise<void> => {
  const ballotPapers = await getPersistentBallotPapers(req.params.electionId);
  res.status(HttpStatusCode.ok).json(ballotPapers);
};

export const getBallotPaper = async (
  req: Request<{ ballotPaperId: BallotPaper['id'] }>,
  res: Response<SelectableBallotPaper>,
): Promise<void> => {
  const ballotPaper = await getPersistentBallotPaper(req.params.ballotPaperId);
  res.status(HttpStatusCode.ok).json(ballotPaper);
};

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

export const deleteBallotPaper = async (
  req: Request<{ ballotPaperId: BallotPaper['id'] }>,
  res: Response<void | Response404>,
): Promise<void> => {
  const result = await deletePersistentBallotPaper(req.params.ballotPaperId);
  if (result.numDeletedRows < 1n) {
    res.status(HttpStatusCode.notFound).json(
      response404Object.parse({
        message: 'The provided ballot paper for deletion was not found.',
      }),
    );
    return;
  }
  res.sendStatus(HttpStatusCode.noContent);
};
