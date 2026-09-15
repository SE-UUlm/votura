import { type SelectableUser, selectableUserObject } from '@repo/votura-validators';
import useSWR, { type SWRResponse } from 'swr';
import { apiRoutes } from './apiRoutes.ts';
import { getterFactory } from './getterFactory.ts';

export const useGetUser = (
  id: SelectableUser['id'],
): SWRResponse<SelectableUser, TypeError | undefined> => {
  return useSWR(apiRoutes.users.byId(id), getterFactory(selectableUserObject));
};
