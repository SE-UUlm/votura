import { type EncryptedFilledBallotPaper } from '@repo/votura-validators';
import { HttpStatusCode } from '../../../httpStatusCode.js';
import { getBallotPaperSectionIds } from '../../../services/ballotPapers.service.js';
import { setsEqual } from '../../../utils.js';
import {
  VoteValidationErrorMessage,
  type VoteValidationError,
} from './encryptedFilledBallotPaper.check.js';

/**
 * Check if the sections in the filled ballot paper match the expected sections.
 * @param data The filled ballot paper to validate.
 * @returns A validation error if the structure is invalid, otherwise null.
 */
export const validateBallotPaperStructure = async (
  data: EncryptedFilledBallotPaper,
): Promise<VoteValidationError | null> => {
  const expectedSectionIds = await getBallotPaperSectionIds(data.ballotPaperId);
  const actualSectionIds = Object.keys(data.sections);

  if (!setsEqual(new Set(expectedSectionIds), new Set(actualSectionIds))) {
    return {
      status: HttpStatusCode.badRequest,
      message: VoteValidationErrorMessage.invalidVote,
    };
  }

  return null;
};
