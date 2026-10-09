import type { RequestPasswordResetUser } from '@repo/votura-validators';
import useSWRMutation, { type SWRMutationResponse } from 'swr/mutation';
import { apiRoutes } from './apiRoutes.ts';
import { posterFactory } from './posterFactory.ts';

export const useRequestPasswordReset = (): SWRMutationResponse<
  void,
  Error,
  string,
  RequestPasswordResetUser
> => {
  return useSWRMutation(apiRoutes.users.requestPasswordReset, posterFactory());
};
