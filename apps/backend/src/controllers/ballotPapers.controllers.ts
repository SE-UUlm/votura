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
  deleteBallotPaper as deletePersistentBallotPaper,
  getBallotPaper as getPersistentBallotPaper,
  getBallotPapers as getPersistentBallotPapers,
  updateBallotPaper as updatePersistentBallotPaper,
} from '../services/ballotPapers.service.js';

export const createBallotPaper = async (
  req: Request<{ electionId: Election['id'] }>,
  res: Response<SelectableBallotPaper | Response400 | Response500>,
): Promise<void> => {
  const body: unknown = req.body;
  const { data, error, success } = await insertableBallotPaperObject.safeParseAsync(body);
  if (success === false) {
    res.status(HttpStatusCode.BadRequest).send(zodErrorToResponse400(error));
    return;
  }

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

export const deleteBallotPaper = async (
  req: Request<{ electionId: Election['id']; ballotPaperId: BallotPaper['id'] }>,
  res: Response<Response500>,
): Promise<void> => {
  const result = await deletePersistentBallotPaper(req.params.ballotPaperId);
  if (result === false) {
    res
      .status(HttpStatusCode.InternalServerError)
      .json(response500Object.parse({ message: undefined }));
    return;
  }
  res.sendStatus(HttpStatusCode.NoContent);
};
