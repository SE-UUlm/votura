import type { RequestPasswordResetUser } from '@repo/votura-validators';
import useSWRMutation, { type SWRMutationResponse } from 'swr/mutation';
import { apiRoutes } from './apiRoutes.ts';
import { publicPosterFactory } from './publicPosterFactory.ts';

export const useRequestPasswordReset = (): SWRMutationResponse<
  void,
  Error,
  string,
  RequestPasswordResetUser
> => {
  return useSWRMutation(apiRoutes.users.requestPasswordReset, publicPosterFactory());
};
