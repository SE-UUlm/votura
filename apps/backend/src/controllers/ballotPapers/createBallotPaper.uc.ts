import {
  insertableBallotPaperObject,
  zodErrorToResponse400,
  type Election,
  type Response400,
  type SelectableBallotPaper,
} from '@repo/votura-validators';
import type { Request, Response } from 'express';
import { HttpStatusCode } from '../../httpStatusCode.js';
import { createBallotPaper as createPersistentBallotPaper } from '../../services/ballotPapers.service.js';

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
