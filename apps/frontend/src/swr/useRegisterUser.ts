import type { AuthenticatableUser } from '@repo/votura-validators';
import useSWRMutation, { type SWRMutationResponse } from 'swr/mutation';
import { apiRoutes } from './apiRoutes.ts';
import { posterFactory } from './posterFactory.ts';

export const useRegisterUser = (): SWRMutationResponse<void, Error, string, AuthenticatableUser> => {
  return useSWRMutation(apiRoutes.users.base, posterFactory());
};
