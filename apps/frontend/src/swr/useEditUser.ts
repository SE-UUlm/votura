import type { EditUserData, SelectableUser } from '@repo/votura-validators';
import useSWRMutation, { type SWRMutationResponse } from 'swr/mutation';
import { apiRoutes } from './apiRoutes.ts';
import { posterFactory } from './posterFactory.ts';

export const useEditUser = (
  userId: SelectableUser['id'],
): SWRMutationResponse<void, Error, string, EditUserData> => {
  return useSWRMutation(apiRoutes.users.editById(userId), posterFactory());
};
