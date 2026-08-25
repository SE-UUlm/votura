import type { EditUserData, SelectableUser } from '@repo/votura-validators';
import { mutate } from 'swr';
import useSWRMutation, { type SWRMutationResponse } from 'swr/mutation';
import { apiRoutes } from './apiRoutes.ts';
import { deleterFactory } from './deleterFactory.ts';

export const useDeleteUser = (
  userId: SelectableUser['id'],
): SWRMutationResponse<void, Error, string, EditUserData> => {
  return useSWRMutation(apiRoutes.users.deleteById(userId), deleterFactory(), {
    onSuccess: () => {
      mutate(apiRoutes.users.all).catch((error) => {
        console.error('Failed to mutate users', error);
      });
    },
  });
};
