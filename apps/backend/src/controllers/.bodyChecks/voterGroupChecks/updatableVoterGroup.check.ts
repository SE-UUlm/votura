import {
  updateableVoterGroupObject,
  zodErrorToResponse400,
  type UpdateableVoterGroup,
} from '@repo/votura-validators';
import { HttpStatusCode } from '../../../httpStatusCode.js';
import { defaultVoterGroupChecks, type VoterGroupValidationError } from './common.check.js';

export const validateUpdateableVoterGroup = async (
  body: unknown,
  userId: string,
): Promise<UpdateableVoterGroup | VoterGroupValidationError> => {
  // Validate the request body against the updateableVoterGroupObject schema
  const { data, error, success } = await updateableVoterGroupObject.safeParseAsync(body);
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
