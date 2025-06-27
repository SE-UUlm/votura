import { type SelectableElection, selectableElectionObject } from '@repo/votura-validators';
import useSWR from 'swr';
import { apiRoutes } from '../apiRoutes.ts';
import { getterFactory } from '../getterFactory.ts';
import { toArraySchema } from '../toArraySchema.ts';
import type { ApiHook } from '../types/ApiHook';

export const useGetElections: ApiHook<SelectableElection[]> = () => {
  return useSWR(apiRoutes.elections.base, getterFactory(toArraySchema(selectableElectionObject)));
};
