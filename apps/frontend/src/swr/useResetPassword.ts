import type { PasswordResetUser } from '@repo/votura-validators';
import useSWRMutation, { type SWRMutationResponse } from 'swr/mutation';
import { apiRoutes } from './apiRoutes.ts';
import { publicPosterFactory } from './publicPosterFactory.ts';

export const useResetPassword = (): SWRMutationResponse<void, Error, string, PasswordResetUser> => {
  return useSWRMutation(apiRoutes.users.resetPassword, publicPosterFactory());
};
