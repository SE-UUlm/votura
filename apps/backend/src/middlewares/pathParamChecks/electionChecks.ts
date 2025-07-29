import {
  response403Object,
  response404Object,
  uuidObject,
  zodErrorToResponse400,
  type Election,
  type Response400,
  type Response403,
  type Response404,
  type SelectableUser,
} from '@repo/votura-validators';
import type { NextFunction, Request, Response } from 'express';
import { HttpStatusCode } from '../../httpStatusCode.js';
import {
  checkElectionExists as checkElectionExistsService,
  getElectionVotingStart,
  isElectionFrozen,
  isElectionGeneratingKeys,
  isUserOwnerOfElection,
} from '../../services/elections.service.js';

/**
 * Checks if the election ID in the request parameters is a valid UUID.
 * If the UUID is invalid, it sends a 400 Bad Request response with the error details.
 * If the UUID is valid, it calls the next middleware function.
 *
 * @param req The request object containing the election ID as a path parameter.
 * @param res The response object to send errors to.
 * @param next The next middleware function to call if the UUID is valid.
 */
export async function checkElectionUuid(
  req: Request<{ electionId: string }>,
  res: Response<Response400>,
  next: NextFunction,
): Promise<void> {
  const parsedUuid = await uuidObject.safeParseAsync(req.params.electionId);

  if (!parsedUuid.success) {
    res.status(HttpStatusCode.badRequest).send(zodErrorToResponse400(parsedUuid.error));
  } else {
    next();
  }
}

/**
 * Checks if the election with the given ID in the request exists in the database.
 * If it does not exist, it sends a 404 Not Found response, otherwise it calls the next middleware function.
 *
 * @param req The request object containing the election ID as a path parameter.
 * @param res The response object to send errors to.
 * @param next The next middleware function to call if the election exists.
 */
export async function checkElectionExists(
  req: Request<{ electionId: Election['id'] }>,
  res: Response<Response404>,
  next: NextFunction,
): Promise<void> {
  if (!(await checkElectionExistsService(req.params.electionId))) {
    res.status(HttpStatusCode.notFound).json(
      response404Object.parse({
        message: 'The provided election does not exist!',
      }),
    );
  } else {
    next();
  }
}

/**
 * Checks if the user is the owner of the election with the given ID.
 * If the user is not the owner, it sends a 403 Forbidden response.
 * If the user is the owner, it calls the next middleware function.
 *
 * @param req The request object containing the election ID and user ID as path parameters.
 * @param res The response object to send errors to.
 * @param next The next middleware function to call if the user is the owner.
 */
export async function checkUserOwnerOfElection(
  req: Request<{ electionId: Election['id'] }>,
  res: Response<Response403, { user: SelectableUser }>,
  next: NextFunction,
): Promise<void> {
  if (!(await isUserOwnerOfElection(req.params.electionId, res.locals.user.id))) {
    res.status(HttpStatusCode.forbidden).json(
      response403Object.parse({
        message: 'You do not have the permission to access or modify this election.',
      }),
    );
  } else {
    next();
  }
}

/**
 * Checks if the election with the given ID is frozen.
 * If the election is frozen, it sends a 403 Forbidden response.
 * If the election is not frozen, it calls the next middleware function.
 *
 * @param req The request object containing the election ID as a path parameter.
 * @param res The response object to send errors to.
 * @param next The next middleware function to call if the election is not frozen.
 */
export async function checkElectionNotFrozen(
  req: Request<{ electionId: Election['id'] }>,
  res: Response<Response403>,
  next: NextFunction,
): Promise<void> {
  if (await isElectionFrozen(req.params.electionId)) {
    res.status(HttpStatusCode.forbidden).json(
      response403Object.parse({
        message: 'The election is frozen and cannot be modified.',
      }),
    );
  } else {
    next();
  }
}

/**
 * Checks if a election is currently generating it's keys.
 * If the config of the election is frozen but the public key is still null the generation process is not finished.
 * If this is the case it sends a 403 else calls the next middleware function.
 *
 * @param req The request containing the validated election id.
 * @param res The response object to send any error.
 * @param next The next middleware function.
 */
export async function checkElectionNotGenerateKeys(
  req: Request<{ electionId: Election['id'] }>,
  res: Response<Response403>,
  next: NextFunction,
): Promise<void> {
  if (await isElectionGeneratingKeys(req.params.electionId)) {
    res.status(HttpStatusCode.forbidden).json(
      response403Object.parse({
        message:
          'Currently the generation of the election keys are running. ' +
          'For consistency you are not allowed to do this action. ' +
          'Please retry in some minutes.',
      }),
    );
  } else {
    next();
  }
}

/**
 * Checks if the voting start date of the election with the given ID is in the future.
 * If the voting start date is in the past, it sends a 403 Forbidden response.
 * If the voting start date is in the future, it calls the next middleware function.
 *
 * @param req The request object containing the election ID as a path parameter.
 * @param res The response object to send errors to.
 * @param next The next middleware function to call if the election is not frozen.
 */
export async function checkVotingStartInFuture(
  req: Request<{ electionId: Election['id'] }>,
  res: Response<Response403>,
  next: NextFunction,
): Promise<void> {
  const votingStart = await getElectionVotingStart(req.params.electionId);

  if (votingStart < new Date()) {
    res.status(HttpStatusCode.forbidden).json(
      response403Object.parse({
        message:
          'The voting start date is in the past. ' +
          'You are only allowed to do this action if the voting start date is in the future.',
      }),
    );
  } else {
    next();
  }
}

export const defaultElectionChecks = [
  checkElectionUuid,
  checkElectionExists,
  checkUserOwnerOfElection,
];
