import { type InsertableUser } from '@repo/votura-validators';
import useSWRMutation, { type SWRMutationResponse } from 'swr/mutation';
import { apiRoutes } from './apiRoutes.ts';
import { posterFactory } from './posterFactory.ts';

export const useRegisterUser = (): SWRMutationResponse<void, Error, string, InsertableUser> => {
  return useSWRMutation(apiRoutes.users.base, posterFactory());
};
