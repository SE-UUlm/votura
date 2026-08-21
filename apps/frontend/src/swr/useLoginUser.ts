import {
  type ApiTokenUser,
  apiTokenUserObject,
  type AuthenticatableUser,
} from '@repo/votura-validators';
import useSWRMutation, { type SWRMutationResponse } from 'swr/mutation';
import { apiRoutes } from './apiRoutes.ts';
import { posterFactory } from './posterFactory.ts';

export const useLoginUser = (): SWRMutationResponse<
  ApiTokenUser,
  Error,
  string,
  AuthenticatableUser
> => {
  return useSWRMutation(apiRoutes.users.login, posterFactory(apiTokenUserObject));
};
