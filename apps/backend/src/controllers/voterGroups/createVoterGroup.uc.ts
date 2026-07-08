import {
  response4XXObject,
  type InsertableVoterGroup,
  type Response400,
  type Response403,
  type Response404,
  type Response500,
  type SelectableUser,
  type SelectableVoterGroup,
} from '@repo/votura-validators';
import type { Request, Response } from 'express';
import { HttpStatusCode } from '../../httpStatusCode.js';
import { createVoterGroup as createPersistentVoterGroup } from '../../services/voterGroups.service.js';
import { isBodyCheckValidationError } from '../bodyChecks/bodyCheckValidationError.js';
import { validateInsertableVoterGroup } from '../bodyChecks/voterGroupChecks.js';

export const createVoterGroup = async (
  req: Request,
  res: Response<
    SelectableVoterGroup | Response400 | Response403 | Response404 | Response500,
    { user: SelectableUser }
  >,
): Promise<void> => {
  const validationResult = await validateInsertableVoterGroup(req.body, res.locals.user.id);

  if (isBodyCheckValidationError(validationResult)) {
    res
      .status(validationResult.status)
      .json(response4XXObject.parse({ message: validationResult.message }));
    return;
  }

  // If we reach this point, the request body is valid
  const insertableVoterGroup: InsertableVoterGroup = validationResult;

  // Proceed with creating the voter group
  const voterGroup = await createPersistentVoterGroup(insertableVoterGroup, res.locals.user.id);
  res.status(HttpStatusCode.created).send(voterGroup);
};
