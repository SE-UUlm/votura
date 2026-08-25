import type { EditUserData, SelectableUser } from '@repo/votura-validators';
import useSWRMutation, { type SWRMutationResponse } from 'swr/mutation';
import { apiRoutes } from './apiRoutes.ts';
import { posterFactory } from './posterFactory.ts';
import {mutate} from "swr";

export const useEditUser = (
  userId: SelectableUser['id'],
): SWRMutationResponse<void, Error, string, EditUserData> => {
  return useSWRMutation(apiRoutes.users.editById(userId), posterFactory(), {
    onSuccess: () => {
      mutate(apiRoutes.users.all).catch((error) => {
        console.error('Failed to mutate users', error);
      });
    }
  });
};
