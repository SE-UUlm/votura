import {
  type ApiTokenUser,
  apiTokenUserObject,
  type InsertableUser,
} from '@repo/votura-validators';
import useSWRMutation, { type SWRMutationResponse } from 'swr/mutation';
import { apiRoutes } from './apiRoutes.ts';
import { posterFactory } from './posterFactory.ts';

export const useLoginUser = (): SWRMutationResponse<
  ApiTokenUser,
  Error,
  string,
  InsertableUser
> => {
  return useSWRMutation(apiRoutes.users.login, posterFactory(apiTokenUserObject));
};
