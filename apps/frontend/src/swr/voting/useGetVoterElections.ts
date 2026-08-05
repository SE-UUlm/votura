import useSWR from 'swr';
import axios from 'axios';
import { apiRoutes } from '../apiRoutes.ts';
import { toArraySchema } from '../toArraySchema.ts';
import { selectableVotingElectionObject, type SelectableVotingElection } from '@repo/votura-validators';
import type { ParametrizedApiHook } from '../types/ApiHook';
import { getVoterLocalStorage } from '../voterToken.ts';

export interface UseGetVoterElectionsParams {
  token?: string | null;
}

export const useGetVoterElections: ParametrizedApiHook<UseGetVoterElectionsParams, SelectableVotingElection[]> = (
  { token },
  options,
) => {
  const skipFetchByOption = options?.skipFetch ?? false;
  let tokenFromStorage: string | null = token ?? getVoterLocalStorage();

  if (tokenFromStorage === undefined || tokenFromStorage === 'undefined' || (typeof tokenFromStorage === 'string' && tokenFromStorage.trim() === '')) {
    tokenFromStorage = null;
  }

  const shouldFetch = !skipFetchByOption && tokenFromStorage !== null;

  const key = shouldFetch
    ? {
      url: '/voting/getElections',
      token: tokenFromStorage,
    }
    : null;
  return useSWR(
    key,
    async ({ token }: { token: string }) => {
      console.log('FETCH TOKEN:', token);

      const instance = axios.create({
        baseURL: apiRoutes.base,
      });

      const response = await instance.get('/voting/getElections', {
        headers: {
          // eslint-disable-next-line @typescript-eslint/naming-convention
          Accept: 'application/json',
          // eslint-disable-next-line @typescript-eslint/naming-convention
          Authorization: `Bearer ${token}`,
        },
      });

      const parsed = await toArraySchema(
        selectableVotingElectionObject,
      ).safeParseAsync(response.data);

      if (!parsed.success) {
        throw new TypeError('Parsing failed');
      }

      return parsed.data;
    },
  );
};
