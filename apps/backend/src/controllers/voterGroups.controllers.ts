import {
  response400Object,
  response403Object,
  response404Object,
  response500Object,
  type InsertableVoterGroup,
  type Response400,
  type Response403,
  type Response404,
  type Response500,
  type SelectableUser,
  type SelectableVoterGroup,
} from '@repo/votura-validators';
import type { Request, Response } from 'express';
import { HttpStatusCode } from '../httpStatusCode.js';
import {
  createVoterGroup as createPersistentVoterGroup,
  deleteVoterGroup as deletePersistentVoterGroup,
  getVoterGroup,
  getVoterGroupsForUser,
  updateVoterGroup as updatePersistentVoterGroup,
} from '../services/voterGroups.service.js';
import { isBodyCheckValidationError } from './bodyChecks/bodyCheckValidationError.js';
import {
  validateInsertableVoterGroup,
  validateUpdateableVoterGroup,
} from './bodyChecks/voterGroupChecks.js';

export const createVoterGroup = async (
  req: Request,
  res: Response<
    SelectableVoterGroup | Response400 | Response403 | Response404 | Response500,
    { user: SelectableUser }
  >,
): Promise<void> => {
  const validationResult = await validateInsertableVoterGroup(req.body, res.locals.user.id);

  if (isBodyCheckValidationError(validationResult)) {
    switch (validationResult.status) {
      case HttpStatusCode.badRequest:
        res
          .status(HttpStatusCode.badRequest)
          .json(response400Object.parse({ message: validationResult.message }));
        break;
      case HttpStatusCode.forbidden:
        res
          .status(HttpStatusCode.forbidden)
          .json(response403Object.parse({ message: validationResult.message }));
        break;
      case HttpStatusCode.notFound:
        res
          .status(HttpStatusCode.notFound)
          .json(response404Object.parse({ message: validationResult.message }));
        break;
      default:
        res
          .status(HttpStatusCode.internalServerError)
          .json(response500Object.parse({ message: undefined }));
    }
    return;
  }

  // If we reach this point, the request body is valid
  const insertableVoterGroup: InsertableVoterGroup = validationResult;

  // Proceed with creating the voter group
  const voterGroup = await createPersistentVoterGroup(insertableVoterGroup, res.locals.user.id);
  res.status(HttpStatusCode.created).send(voterGroup);
};

export const getVoterGroups = async (
  _req: Request,
  res: Response<SelectableVoterGroup[], { user: SelectableUser }>,
): Promise<void> => {
  const voterGroups = await getVoterGroupsForUser(res.locals.user.id);
  res.status(HttpStatusCode.ok).json(voterGroups);
};

export const updateVoterGroup = async (
  req: Request<{ voterGroupId: string }>,
  res: Response<
    SelectableVoterGroup | Response400 | Response403 | Response404 | Response500,
    { user: SelectableUser }
  >,
): Promise<void> => {
  const validationResult = await validateUpdateableVoterGroup(req.body, res.locals.user.id);

  if (isBodyCheckValidationError(validationResult)) {
    switch (validationResult.status) {
      case HttpStatusCode.badRequest:
        res
          .status(HttpStatusCode.badRequest)
          .json(response400Object.parse({ message: validationResult.message }));
        break;
      case HttpStatusCode.forbidden:
        res
          .status(HttpStatusCode.forbidden)
          .json(response403Object.parse({ message: validationResult.message }));
        break;
      case HttpStatusCode.notFound:
        res
          .status(HttpStatusCode.notFound)
          .json(response404Object.parse({ message: validationResult.message }));
        break;
      default:
        res
          .status(HttpStatusCode.internalServerError)
          .json(response500Object.parse({ message: undefined }));
    }
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

export const getSpecificVoterGroup = async (
  req: Request<{ voterGroupId: string }>,
  res: Response<SelectableVoterGroup, { user: SelectableUser }>,
): Promise<void> => {
  const voterGroup = await getVoterGroup(req.params.voterGroupId);
  res.status(HttpStatusCode.ok).json(voterGroup);
};

export const deleteVoterGroup = async (
  req: Request<{ voterGroupId: string }>,
  res: Response<void, { user: SelectableUser }>,
): Promise<void> => {
  await deletePersistentVoterGroup(req.params.voterGroupId);
  res.status(HttpStatusCode.noContent).send();
};
