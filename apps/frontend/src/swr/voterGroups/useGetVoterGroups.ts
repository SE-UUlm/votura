import { type SelectableVoterGroup, selectableVoterGroupObject } from '@repo/votura-validators';
import useSWR from 'swr';
import { apiRoutes } from '../apiRoutes.ts';
import { getterFactory } from '../getterFactory.ts';
import { toArraySchema } from '../toArraySchema.ts';
import type { ApiHook } from '../types/ApiHook';

export const useGetVoterGroups: ApiHook<SelectableVoterGroup[]> = () => {
  return useSWR(
    apiRoutes.voterGroups.base,
    getterFactory(toArraySchema(selectableVoterGroupObject)),
  );
};
