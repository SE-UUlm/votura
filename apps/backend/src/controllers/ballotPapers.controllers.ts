import {
  insertableBallotPaperObject,
  response500Object,
  updateableBallotPaperObject,
  zodErrorToResponse400,
  type BallotPaper,
  type Election,
  type Response400,
  type Response500,
  type SelectableBallotPaper,
} from '@repo/votura-validators';
import type { Request, Response } from 'express';
import { HttpStatusCode } from '../httpStatusCode.js';
import {
  createBallotPaper as createPersistentBallotPaper,
  getBallotPaper as getPersistentBallotPaper,
  getBallotPapers as getPersistentBallotPapers,
  updateBallotPaper as updatePersistentBallotPaper,
} from '../services/ballotPapers.service.js';

export const createBallotPaper = async (
  req: Request<{ electionId: Election['id'] }>,
  res: Response<SelectableBallotPaper | Response400 | Response500>,
): Promise<void> => {
  // Validate body
  const body: unknown = req.body;
  const { data, error, success } = await insertableBallotPaperObject.safeParseAsync(body);
  if (success === false) {
    res.status(HttpStatusCode.BadRequest).send(zodErrorToResponse400(error));
    return;
  }

  // Create the ballot paper
  const selectableBallotPaper = await createPersistentBallotPaper(data, req.params.electionId);
  if (selectableBallotPaper === null) {
    res
      .status(HttpStatusCode.InternalServerError)
      .json(response500Object.parse({ message: undefined }));
    return;
  }
  res.status(HttpStatusCode.Created).json(selectableBallotPaper);
};

export const getBallotPapers = async (
  req: Request<{ electionId: Election['id'] }>,
  res: Response<SelectableBallotPaper[]>,
): Promise<void> => {
  const ballotPapers = await getPersistentBallotPapers(req.params.electionId);
  res.status(HttpStatusCode.Ok).json(ballotPapers);
};

export const getBallotPaper = async (
  req: Request<{ ballotPaperId: BallotPaper['id'] }>,
  res: Response<SelectableBallotPaper | Response500>,
): Promise<void> => {
  const ballotPaper = await getPersistentBallotPaper(req.params.ballotPaperId);
  if (ballotPaper === null) {
    res
      .status(HttpStatusCode.InternalServerError)
      .json(response500Object.parse({ message: undefined }));
    return;
  }
  res.status(HttpStatusCode.Ok).json(ballotPaper);
};

/**
 * Validates the request body and updates an existing ballot paper.
 * If the body is invalid, it responds with a 400 status code.
 * If the ballot paper cannot be updated, it responds with a 500 status code.
 *
 * @param req The request object.
 * @param res The response object.
 * @returns A promise that resolves when the update is complete.
 */
export const updateBallotPaper = async (
  req: Request<{ electionId: Election['id']; ballotPaperId: BallotPaper['id'] }>,
  res: Response<SelectableBallotPaper | Response400 | Response500>,
): Promise<void> => {
  const body: unknown = req.body;
  const { data, error, success } = await updateableBallotPaperObject.safeParseAsync(body);
  if (success === false) {
    res.status(HttpStatusCode.BadRequest).send(zodErrorToResponse400(error));
    return;
  }

  const selectableBallotPaper = await updatePersistentBallotPaper(data, req.params.ballotPaperId);
  if (selectableBallotPaper === null) {
    res
      .status(HttpStatusCode.InternalServerError)
      .json(response500Object.parse({ message: undefined }));
    return;
  }
  res.status(HttpStatusCode.Ok).json(selectableBallotPaper);
};
