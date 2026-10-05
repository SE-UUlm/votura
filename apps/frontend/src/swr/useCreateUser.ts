import type { CreateUserData } from '@repo/votura-validators';
import useSWRMutation, { type SWRMutationResponse } from 'swr/mutation';
import { apiRoutes } from './apiRoutes.ts';
import { posterFactory } from './posterFactory.ts';

export const useCreateUser = (): SWRMutationResponse<void, Error, string, CreateUserData> => {
  return useSWRMutation(apiRoutes.users.create, posterFactory());
};
