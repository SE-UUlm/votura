import {
  selectableElectionResultObject,
  type SelectableElection,
  type SelectableElectionResult,
} from '@repo/votura-validators';
import axios from 'axios';
import useSWR from 'swr';
import { apiRoutes } from '../apiRoutes.ts';
import type { ParametrizedApiHook } from '../types/ApiHook';

export interface UseGetElectionResultsParams {
  electionId: SelectableElection['id'] | undefined;
}

export const useGetElectionResults: ParametrizedApiHook<
  UseGetElectionResultsParams,
  SelectableElectionResult
> = ({ electionId }, options) => {
  const skipFetchByOption = options?.skipFetch ?? false;
  const shouldFetch = !skipFetchByOption && electionId !== undefined;

  return useSWR(shouldFetch ? apiRoutes.results.byId(electionId) : null, async (url: string) => {
    // The results are public, so no authorization header is sent (see the voting hooks)
    const instance = axios.create({
      baseURL: apiRoutes.base,
    });

    const response = await instance.get(url, {
      headers: {
        // eslint-disable-next-line @typescript-eslint/naming-convention
        Accept: 'application/json',
      },
    });

    const parsed = await selectableElectionResultObject.safeParseAsync(response.data);

    if (!parsed.success) {
      throw new TypeError('Parsing failed');
    }

    return parsed.data;
  });
};
