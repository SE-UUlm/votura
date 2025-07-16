import { db } from '@repo/db';
import type { BallotPaper as DBBallotPaper } from '@repo/db/types';
import {
  insertableBallotPaperSectionObject,
  response400Object,
  updateableBallotPaperObject,
  updateableBallotPaperSectionObject,
  zodErrorToResponse400,
  type BallotPaper,
  type BallotPaperSection,
  type Election,
  type Response400,
} from '@repo/votura-validators';
import type { NextFunction, Request, Response } from 'express';
import { HttpStatusCode } from '../httpStatusCode.js';

export enum RequestTypeMaxVotesCheck {
  ballotPaperUpdate = 'ballotPaperUpdate',
  ballotPaperSectionCreate = 'ballotPaperSectionCreate',
  ballotPaperSectionUpdate = 'ballotPaperSectionUpdate',
}

/**
 * Parses the request body to extract the max votes value based on the request type.
 *
 * @param reqType The type of request being made, which determines how to parse the body.
 * @param req The request object containing the body to parse.
 * @param res The response object to send errors to if parsing fails.
 * @returns A promise that resolves to the max votes value if parsing is successful, or null if it fails.
 */
const parseRequestMaxVotes = async (
  reqType: RequestTypeMaxVotesCheck,
  req: Request,
  res: Response<Response400>,
): Promise<number | null> => {
  let result = null;
  if (reqType === RequestTypeMaxVotesCheck.ballotPaperUpdate) {
    result = await updateableBallotPaperObject.safeParseAsync(req.body);
  } else if (reqType === RequestTypeMaxVotesCheck.ballotPaperSectionCreate) {
    result = await insertableBallotPaperSectionObject.safeParseAsync(req.body);
  } else {
    result = await updateableBallotPaperSectionObject.safeParseAsync(req.body);
  }
  const { data, error, success } = result;
  if (!success) {
    res.status(HttpStatusCode.badRequest).send(zodErrorToResponse400(error));
    return null;
  }
  return data.maxVotes;
};

/**
 * Get the maxVotes for the ballot paper with the given ballotPaperId
 *
 * @param ballotPaperId The id of the ballot paper to get maxVotes from
 * @param res The response object to send errors to if getting the ballot paper fails
 * @returns A promise that resolves to the max votes value if successful, or null if unsuccessful
 */
const getBallotPaperMaxVotes = async (
  ballotPaperId: BallotPaper['id'],
): Promise<DBBallotPaper['maxVotes']> => {
  const ballotPaper = await db
    .selectFrom('ballotPaper')
    .select(['maxVotes'])
    .where('id', '=', ballotPaperId)
    .executeTakeFirstOrThrow();

  return ballotPaper.maxVotes;
};

const checkBallotPaperUpdate = async (
  ballotPaperId: BallotPaper['id'],
  oldMaxVotes: DBBallotPaper['maxVotes'],
  requestMaxVotes: BallotPaper['maxVotes'],
  res: Response<Response400>,
  next: NextFunction,
): Promise<void> => {
  if (requestMaxVotes > oldMaxVotes) {
    next();
    return;
  }

  const ballotPaperSections = await db
    .selectFrom('ballotPaperSection')
    .select(['maxVotes'])
    .where('ballotPaperId', '=', ballotPaperId)
    .execute();

  const maxVotesFromSections = Math.max(
    ...ballotPaperSections.map((section) => section.maxVotes),
    0,
  );

  if (maxVotesFromSections > requestMaxVotes) {
    res.status(HttpStatusCode.badRequest).json(
      response400Object.parse({
        message: `The max votes for the ballot paper can not be lower than for any of the linked ballot paper sections.`,
      }),
    );
    return;
  }
  next();
};

const checkBallotPaperSection = (
  ballotPaperMaxVotes: DBBallotPaper['maxVotes'],
  requestMaxVotes: BallotPaperSection['maxVotes'],
  res: Response<Response400>,
  next: NextFunction,
): void => {
  if (requestMaxVotes > ballotPaperMaxVotes) {
    res.status(HttpStatusCode.badRequest).json(
      response400Object.parse({
        message: `The max votes for the ballot paper section cannot be greater than the max votes of the ballot paper.`,
      }),
    );
    return;
  }
  next();
};

/**
 * Depending on the given reqType, checks if the request to update a ballot paper or create/update a ballot paper section
 * does not violate the rule, that maxVotes of a ballot paper needs to be greater than or equal to maxVotes of all linked
 * ballot paper sections.
 * If it is not the case, it sends a 400 Bad Request response, otherwise it calls the next middleware function.
 * The parameters of the request need to be validated before calling this function.
 *
 * @param reqTarget The target type for the request, which can be either 'ballotPaper' or 'ballotPaperSection'.
 * @param req The request object containing the ballot paper ID as a path parameter.
 * @param res The response object to send errors to.
 * @param next The next middleware function to call if the check passes.
 */
export const maxVotesCheckFor = (reqType: RequestTypeMaxVotesCheck) => {
  return async (
    req: Request<{
      electionId: Election['id'];
      ballotPaperId: BallotPaper['id'];
      ballotPaperSectionId?: BallotPaperSection['id'];
    }>,
    res: Response<Response400>,
    next: NextFunction,
  ): Promise<void> => {
    const ballotPaperId = req.params.ballotPaperId;
    const ballotPaperMaxVotes = await getBallotPaperMaxVotes(ballotPaperId);

    const requestMaxVotes = await parseRequestMaxVotes(reqType, req, res);
    if (requestMaxVotes === null) {
      return;
    }

    if (reqType === RequestTypeMaxVotesCheck.ballotPaperUpdate) {
      await checkBallotPaperUpdate(ballotPaperId, ballotPaperMaxVotes, requestMaxVotes, res, next);
    } else {
      checkBallotPaperSection(ballotPaperMaxVotes, requestMaxVotes, res, next);
    }
  };
};
