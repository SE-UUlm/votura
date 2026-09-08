import { type UserCount, userCountObject } from '@repo/votura-validators';
import useSWR from 'swr';
import { apiRoutes } from './apiRoutes.ts';
import { getterFactory } from './getterFactory.ts';
import type { ApiHook } from './types/ApiHook';

export const useUserCount: ApiHook<UserCount> = () => {
  return useSWR(apiRoutes.users.count, getterFactory(userCountObject));
};
