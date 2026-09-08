import {
  insertableVoterGroupObject,
  zodErrorToResponse400,
  type InsertableVoterGroup,
} from '@repo/votura-validators';
import { HttpStatusCode } from '../../../httpStatusCode.js';
import { defaultVoterGroupChecks, type VoterGroupValidationError } from './common.check.js';

export const validateInsertableVoterGroup = async (
  body: unknown,
  userId: string,
): Promise<InsertableVoterGroup | VoterGroupValidationError> => {
  // Validate the request body against the insertableVoterGroupObject schema
  const { data, error, success } = await insertableVoterGroupObject.safeParseAsync(body);
  if (!success) {
    return {
      status: HttpStatusCode.badRequest,
      message: zodErrorToResponse400(error).message,
    };
  }

  const validationError = await defaultVoterGroupChecks(userId, data.ballotPapers);
  if (validationError !== null) {
    return validationError;
  }
  return data;
};
