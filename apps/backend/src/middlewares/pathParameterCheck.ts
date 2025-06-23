import {
  response403Object,
  response404Object,
  uuidObject,
  zodErrorToResponse400,
  type Response400,
  type Response403,
  type Response404,
  type SelectableUser,
} from '@repo/votura-validators';
import type { NextFunction, Request, Response } from 'express';
import { HttpStatusCode } from '../httpStatusCode.js';
import { exitsElection, isValidOwnerOfElection } from './checkFunctions/electionCheck.js';

export const electionIdCheck = async (
  req: Request,
  res: Response<Response400 | Response403 | Response404, { user: SelectableUser }>,
  next: NextFunction,
): Promise<void> => {
  const electionId = await uuidObject.safeParseAsync(req.params.electionId);

  if (electionId.success === false) {
    res.status(HttpStatusCode.BadRequest).send(zodErrorToResponse400(electionId.error));
    return;
  }

  const exists = await exitsElection(electionId.data);
  if (exists !== true) {
    res.status(HttpStatusCode.NotFound).json(
      response404Object.parse({
        message: 'The parent election for this ballot paper does not exist!',
      }),
    );
    return;
  }

  const isValidOwner = await isValidOwnerOfElection(electionId.data, res.locals.user.id);
  if (isValidOwner !== true) {
    res.status(HttpStatusCode.Forbidden).json(response403Object.parse({ undefined }));
    return;
  }

  next();
};
