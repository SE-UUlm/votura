import {
  response400Object,
  response403Object,
  response404Object,
  zodErrorToResponse400,
  type InsertableVoterGroup,
  type Response400,
  type Response403,
  type Response404,
  type SelectableUser,
  type SelectableVoterGroup,
} from '@repo/votura-validators';
import type { Request, Response } from 'express';
import { ZodError } from 'zod/v4';
import { HttpStatusCode } from '../httpStatusCode.js';
import {
  createVoterGroup as createPersistentVoterGroup,
  getVoterGroupsForUser,
} from '../services/voterGroups.service.js';
import {
  validateInsertableVoterGroup,
  VoterGroupValidationError,
} from './bodyChecks/voterGroup.js';

export type CreateVoterGroupResponse = Response<
  SelectableVoterGroup | Response400 | Response403 | Response404,
  { user: SelectableUser }
>;

export const createVoterGroup = async (
  req: Request,
  res: CreateVoterGroupResponse,
): Promise<void> => {
  const validationResult = await validateInsertableVoterGroup(req.body, res.locals.user.id);

  if (validationResult instanceof ZodError) {
    res.status(HttpStatusCode.badRequest).json(zodErrorToResponse400(validationResult));
    return;
  }
  if (validationResult === VoterGroupValidationError.ballotPaperNotFound) {
    res
      .status(HttpStatusCode.notFound)
      .json(response404Object.parse({ message: VoterGroupValidationError.ballotPaperNotFound }));
    return;
  }
  if (validationResult === VoterGroupValidationError.ballotPaperNotBelongToUser) {
    res
      .status(HttpStatusCode.forbidden)
      .json(
        response403Object.parse({ message: VoterGroupValidationError.ballotPaperNotBelongToUser }),
      );
    return;
  }
  if (validationResult === VoterGroupValidationError.ballotPapersFromSameElection) {
    res.status(HttpStatusCode.badRequest).json(
      response400Object.parse({
        message: VoterGroupValidationError.ballotPapersFromSameElection,
      }),
    );
    return;
  }
  if (validationResult === VoterGroupValidationError.ballotPapersFromFrozenElection) {
    res.status(HttpStatusCode.badRequest).json(
      response400Object.parse({
        message: VoterGroupValidationError.ballotPapersFromFrozenElection,
      }),
    );
    return;
  }

  // If we reach this point, the request body is valid
  const insertableVoterGroup: InsertableVoterGroup = validationResult;

  // Proceed with creating the voter group
  const voterGroup = await createPersistentVoterGroup(insertableVoterGroup, res.locals.user.id);
  res.status(HttpStatusCode.created).send(voterGroup);
};

export type GetVoterGroupsResponse = Response<SelectableVoterGroup[], { user: SelectableUser }>;

export const getVoterGroups = async (_req: Request, res: GetVoterGroupsResponse): Promise<void> => {
  const userId = res.locals.user.id;

  const voterGroups = await getVoterGroupsForUser(userId);
  res.status(HttpStatusCode.ok).json(voterGroups);
};
