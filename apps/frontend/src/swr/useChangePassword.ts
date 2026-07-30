import type { ChangePasswordUser } from '@repo/votura-validators';
import useSWRMutation, { type SWRMutationResponse } from 'swr/mutation';
import { apiRoutes } from './apiRoutes.ts';
import { posterFactory } from './posterFactory.ts';

export const useChangePassword = (): SWRMutationResponse<
  void,
  Error,
  string,
  ChangePasswordUser
> => {
  return useSWRMutation(apiRoutes.users.changePassword, posterFactory());
};
