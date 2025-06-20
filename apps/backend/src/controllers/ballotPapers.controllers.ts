import {
  insertableBallotPaperObject,
  response500Object,
  zodErrorToResponse400,
  type Response400,
  type Response500,
  type SelectableBallotPaper,
  type SelectableUser,
} from '@repo/votura-validators';
import type { Request, Response } from 'express';
import { HttpStatusCode } from '../httpStatusCode.js';
import { createBallotPaper as createPersistentBallotPaper } from '../services/ballotPapers.service.js';

export const createBallotPaper = async (
  req: Request<{ electionId: string }>,
  res: Response<SelectableBallotPaper | Response400 | Response500, { user: SelectableUser }>,
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
