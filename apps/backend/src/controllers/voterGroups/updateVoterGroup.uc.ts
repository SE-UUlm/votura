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
import { updateVoterGroup as updatePersistentVoterGroup } from '../../services/voterGroups.service.js';
import { isBodyCheckValidationError } from '../bodyChecks/bodyCheckValidationError.js';
import { validateUpdateableVoterGroup } from '../bodyChecks/voterGroupChecks.js';

export const updateVoterGroup = async (
  req: Request<{ voterGroupId: SelectableVoterGroup['id'] }>,
  res: Response<
    SelectableVoterGroup | Response400 | Response403 | Response404 | Response500,
    { user: SelectableUser }
  >,
): Promise<void> => {
  const validationResult = await validateUpdateableVoterGroup(req.body, res.locals.user.id);

  if (isBodyCheckValidationError(validationResult)) {
    res
      .status(validationResult.status)
      .json(response4XXObject.parse({ message: validationResult.message }));
    return;
  }

  // If we reach this point, the request body is valid
  const insertableVoterGroup: InsertableVoterGroup = validationResult;

  // Proceed with updating the voter group
  const voterGroup = await updatePersistentVoterGroup(
    req.params.voterGroupId,
    insertableVoterGroup,
  );
  res.status(HttpStatusCode.ok).send(voterGroup);
};
