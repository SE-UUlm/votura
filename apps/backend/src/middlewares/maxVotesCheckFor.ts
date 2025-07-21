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
 * Parses the request body to extract the maxVotes and maxVotesPerCandidate values based on the request type.
 *
 * @param reqType The type of request being made, which determines how to parse the body.
 * @param req The request object containing the body to parse.
 * @param res The response object to send errors to if parsing fails.
 * @returns A promise that resolves to the maxVotes and maxVotesPerCandidate values if parsing is successful, or null if it fails.
 */
const parseRequestMaxVotes = async (
  reqType: RequestTypeMaxVotesCheck,
  req: Request,
  res: Response<Response400>,
): Promise<{ maxVotes: number; maxVotesPerCandidate: number } | null> => {
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
  return { maxVotes: data.maxVotes, maxVotesPerCandidate: data.maxVotesPerCandidate };
};

/**
 * Get the maxVotes and maxVotesPerCandidate for the ballot paper with the given ballotPaperId
 *
 * @param ballotPaperId The id of the ballot paper to get maxVotes and maxVotesPerCandidate from
 * @param res The response object to send errors to if getting the ballot paper fails
 * @returns A promise that resolves to the maxVotes and maxVotesPerCandidate values if successful, or null if unsuccessful
 */
const getBallotPaperMaxVotes = async (
  ballotPaperId: BallotPaper['id'],
): Promise<{
  maxVotes: DBBallotPaper['maxVotes'];
  maxVotesPerCandidate: DBBallotPaper['maxVotesPerCandidate'];
}> => {
  const ballotPaper = await db
    .selectFrom('ballotPaper')
    .select(['maxVotes', 'maxVotesPerCandidate'])
    .where('id', '=', ballotPaperId)
    .executeTakeFirstOrThrow();

  return { maxVotes: ballotPaper.maxVotes, maxVotesPerCandidate: ballotPaper.maxVotesPerCandidate };
};

const checkBallotPaperUpdate = async (
  ballotPaperId: BallotPaper['id'],
  oldMaxVotes: DBBallotPaper['maxVotes'],
  oldMaxVotesPerCandidate: DBBallotPaper['maxVotesPerCandidate'],
  requestMaxVotes: BallotPaper['maxVotes'],
  requestMaxVotesPerCandidate: BallotPaper['maxVotesPerCandidate'],
  res: Response<Response400>,
  next: NextFunction,
): Promise<void> => {
  if (requestMaxVotes > oldMaxVotes && requestMaxVotesPerCandidate > oldMaxVotesPerCandidate) {
    next();
    return;
  }

  const ballotPaperSections = await db
    .selectFrom('ballotPaperSection')
    .select(['maxVotes', 'maxVotesPerCandidate'])
    .where('ballotPaperId', '=', ballotPaperId)
    .execute();

  const maxVotesFromSections = Math.max(
    ...ballotPaperSections.map((section) => section.maxVotes),
    0,
  );
  const maxVotesPerCandidateFromSections = Math.max(
    ...ballotPaperSections.map((section) => section.maxVotesPerCandidate),
    0,
  );

  let message = '';
  if (maxVotesFromSections > requestMaxVotes) {
    message = `The max votes for the ballot paper can not be lower than for any of the linked ballot paper sections.`;
  } else if (maxVotesPerCandidateFromSections > requestMaxVotesPerCandidate) {
    message = `The max votes per candidate for the ballot paper can not be lower than for any of the linked ballot paper sections.`;
  }
  if (message !== '') {
    res.status(HttpStatusCode.badRequest).json(response400Object.parse({ message }));
    return;
  }
  next();
};

const checkBallotPaperSection = (
  ballotPaperMaxVotes: DBBallotPaper['maxVotes'],
  ballotPaperMaxVotesPerCandidate: DBBallotPaper['maxVotesPerCandidate'],
  requestMaxVotes: BallotPaperSection['maxVotes'],
  requestMaxVotesPerCandidate: BallotPaperSection['maxVotesPerCandidate'],
  res: Response<Response400>,
  next: NextFunction,
): void => {
  let message = '';
  if (requestMaxVotes > ballotPaperMaxVotes) {
    message = `The max votes for the ballot paper section cannot be greater than the max votes of the ballot paper.`;
  } else if (requestMaxVotesPerCandidate > ballotPaperMaxVotesPerCandidate) {
    message = `The max votes per candidate for the ballot paper section cannot be greater than the max votes per candidate of the ballot paper.`;
  }
  if (message !== '') {
    res.status(HttpStatusCode.badRequest).json(response400Object.parse({ message }));
    return;
  }
  next();
};

/**
 * Depending on the given reqType, checks if the request to update a ballot paper or create/update a ballot paper section
 * does not violate the rule, that maxVotes and maxVotesPerCandidate of a ballot paper needs to be greater than or equal to
 * the equivalent values of any ballot paper section linked to it.
 * If this is not the case, it sends a 400 Bad Request response, otherwise it calls the next middleware function.
 * The parameters of the request need to be validated before calling this function.
 *
 * @param reqTarget The target type for the request, which determines how to handle the request.
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
    const { maxVotes: ballotPaperMaxVotes, maxVotesPerCandidate: ballotPaperMaxVotesPerCandidate } =
      await getBallotPaperMaxVotes(req.params.ballotPaperId);

    const parsed = await parseRequestMaxVotes(reqType, req, res);
    if (parsed === null) {
      return;
    }
    const { maxVotes: requestMaxVotes, maxVotesPerCandidate: requestMaxVotesPerCandidate } = parsed;

    if (reqType === RequestTypeMaxVotesCheck.ballotPaperUpdate) {
      await checkBallotPaperUpdate(
        req.params.ballotPaperId,
        ballotPaperMaxVotes,
        ballotPaperMaxVotesPerCandidate,
        requestMaxVotes,
        requestMaxVotesPerCandidate,
        res,
        next,
      );
    } else {
      checkBallotPaperSection(
        ballotPaperMaxVotes,
        ballotPaperMaxVotesPerCandidate,
        requestMaxVotes,
        requestMaxVotesPerCandidate,
        res,
        next,
      );
    }
  };
};
