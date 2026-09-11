import { type SelectableUser, selectableUserObject } from '@repo/votura-validators';
import useSWR from 'swr';
import { apiRoutes } from './apiRoutes.ts';
import { getterFactory } from './getterFactory.ts';
import { toArraySchema } from './toArraySchema.ts';
import type { ApiHook } from './types/ApiHook';

export const useGetUsers: ApiHook<SelectableUser[]> = (options) => {
  return useSWR(
    options?.skipFetch === true ? null : apiRoutes.users.all,
    getterFactory(toArraySchema(selectableUserObject)),
  );
};
