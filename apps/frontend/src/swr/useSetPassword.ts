import type { SetInitialPasswordData } from '@repo/votura-validators';
import useSWRMutation, { type SWRMutationResponse } from 'swr/mutation';
import { apiRoutes } from './apiRoutes.ts';
import { posterFactory } from './posterFactory.ts';

export const useSetPassword = (): SWRMutationResponse<
  void,
  Error,
  string,
  SetInitialPasswordData
> => {
  return useSWRMutation(apiRoutes.users.setInitialPassword, posterFactory());
};
