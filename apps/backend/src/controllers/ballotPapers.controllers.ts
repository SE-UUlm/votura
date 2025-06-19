import type { Request, Response } from 'express';
import {
  insertableBallotPaperObject,
  zodErrorToResponse400,
  response403Object,
  response404Object,
  response500Object,
  uuidObject,
  type Response400,
  type Response500,
  type SelectableUser,
  type SelectableBallotPaper,
} from '@repo/votura-validators';
import { createBallotPaper as createPersistentBallotPaper } from '../services/ballotPapers.service.js';
import { HttpStatusCode } from '../httpStatusCode.js';
import { electionExists, validOwnerOfElection } from './validators.js';

export type CreateBallotPaperResponse = Response<
  SelectableBallotPaper | Response400 | Response500,
  { user: SelectableUser }
>;

export const createBallotPaper = async (
  req: Request,
  res: CreateBallotPaperResponse,
): Promise<void> => {
  // Validate path parameter
  const electionId = await uuidObject.safeParseAsync(req.params.electionId);

  if (electionId.success === false) {
    res.status(HttpStatusCode.BadRequest).send(zodErrorToResponse400(electionId.error));
    return;
  }
  if ((await electionExists(electionId.data)) === false) {
    res.status(HttpStatusCode.NotFound).json(
      response404Object.parse({
        message: 'The parent election for this ballot paper does not exist!',
      }),
    );
    return;
  }
  if ((await validOwnerOfElection(electionId.data, res.locals.user.id)) === false) {
    res.status(HttpStatusCode.Forbidden).json(response403Object.parse({ undefined }));
    return;
  }

  // Validate body
  const body: unknown = req.body;
  const { data, error, success } = await insertableBallotPaperObject.safeParseAsync(body);
  if (success === false) {
    res.status(HttpStatusCode.BadRequest).send(zodErrorToResponse400(error));
    return;
  }

  // Create the ballot paper
  const selectableBallotPaper = await createPersistentBallotPaper(data, electionId.data);
  if (selectableBallotPaper === null) {
    res
      .status(HttpStatusCode.InternalServerError)
      .json(response500Object.parse({ message: undefined }));
    return;
  }
  res.status(HttpStatusCode.Created).json(selectableBallotPaper);
};
