import { type SelectableElection, selectableElectionObject } from '@repo/votura-validators';
import useSWR, { type SWRResponse } from 'swr';
import { apiRoutes } from '../apiRoutes.ts';
import { getterFactory } from '../getterFactory.ts';
import type { ParametrizedApiHook } from '../types/ApiHook';

export interface UseGetElectionParams {
  electionId: SelectableElection['id'] | undefined;
}

export const useGetElection: ParametrizedApiHook<UseGetElectionParams, SelectableElection> = (
  { electionId },
  options,
): SWRResponse<SelectableElection, TypeError | undefined> => {
  const skipFetchByOption = options?.skipFetch ?? false;
  const shouldFetch = !skipFetchByOption && electionId !== undefined;

  return useSWR(
    shouldFetch ? apiRoutes.elections.byId(electionId) : null,
    getterFactory(selectableElectionObject),
  );
};
