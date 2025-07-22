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
import { HttpStatusCode } from '../../httpStatusCode.js';
import {
  checkVoterGroupElectionsNotFrozen as checkVoterGroupElectionsNotFrozenService,
  checkVoterGroupExists as checkVoterGroupExistService,
  getOwnerOfVoterGroup,
} from '../../services/voterGroups.service.js';

export async function checkVoterGroupUuid(
  req: Request<{ voterGroupId: string }>,
  res: Response<Response400>,
  next: NextFunction,
): Promise<void> {
  const parsedUuid = await uuidObject.safeParseAsync(req.params.voterGroupId);

  if (!parsedUuid.success) {
    res.status(HttpStatusCode.badRequest).send(zodErrorToResponse400(parsedUuid.error));
  } else {
    next();
  }
}

export async function checkVoterGroupExists(
  req: Request<{ voterGroupId: string }>,
  res: Response<Response404>,
  next: NextFunction,
): Promise<void> {
  if (!(await checkVoterGroupExistService(req.params.voterGroupId))) {
    res.status(HttpStatusCode.notFound).json(
      response404Object.parse({
        message: `Voter group with ID ${req.params.voterGroupId} does not exist.`,
      }),
    );
  } else {
    next();
  }
}

export async function checkUserOwnerOfVoterGroup(
  req: Request<{ voterGroupId: string }>,
  res: Response<Response403, { user: SelectableUser }>,
  next: NextFunction,
): Promise<void> {
  const voterGroupOwner = await getOwnerOfVoterGroup(req.params.voterGroupId);

  if (voterGroupOwner !== res.locals.user.id) {
    res.status(HttpStatusCode.forbidden).json(
      response403Object.parse({
        message: 'You do not have permission to access or modify this voter group.',
      }),
    );
  } else {
    next();
  }
}

export async function checkVoterGroupElectionsNotFrozen(
  req: Request<{ voterGroupId: string }>,
  res: Response<Response403>,
  next: NextFunction,
): Promise<void> {
  if (!(await checkVoterGroupElectionsNotFrozenService(req.params.voterGroupId))) {
    res.status(HttpStatusCode.forbidden).json(
      response403Object.parse({
        message: 'At least one election associated with this voter group is frozen.',
      }),
    );
  } else {
    next();
  }
}

export const defaultVoterGroupChecks = [
  checkVoterGroupUuid,
  checkVoterGroupExists,
  checkUserOwnerOfVoterGroup,
];
