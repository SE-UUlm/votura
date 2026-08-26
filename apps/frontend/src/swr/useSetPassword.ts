import type { ChangePasswordUser, SelectableUser } from '@repo/votura-validators';
import useSWRMutation, { type SWRMutationResponse } from 'swr/mutation';
import { apiRoutes } from './apiRoutes.ts';
import { posterFactory } from './posterFactory.ts';

export const useSetPassword = (
  userId: SelectableUser['id'],
): SWRMutationResponse<void, Error, string, ChangePasswordUser> => {
  return useSWRMutation(apiRoutes.users.setPasswordById(userId), posterFactory());
};
