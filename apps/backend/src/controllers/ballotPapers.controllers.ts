import type { Request, Response } from 'express';
import {
  insertableBallotPaperObject,
  zodErrorToResponse400,
  response400Object,
  response500Object,
  type Response400,
  type Response500,
  type SelectableBallotPaper,
} from '@repo/votura-validators';
import { createBallotPaper as createPersistentBallotPaper } from '../services/ballotPapers.service.js';
import { HttpStatusCode } from '../httpStatusCode.js';

export type CreateBallotPaperResponse = Response<SelectableBallotPaper | Response400 | Response500>;

export const createBallotPaper = async (
  req: Request,
  res: CreateBallotPaperResponse,
): Promise<void> => {
  const body: unknown = req.body;

  const { data, error, success } = await insertableBallotPaperObject.safeParseAsync(body);

  if (success === false) {
    res.status(HttpStatusCode.BadRequest).send(zodErrorToResponse400(error));
    return;
  }

  if (req.params.electionId === undefined) {
    res
      .status(HttpStatusCode.BadRequest)
      .json(response400Object.parse({ message: 'Invalid path parameter!' }));
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
