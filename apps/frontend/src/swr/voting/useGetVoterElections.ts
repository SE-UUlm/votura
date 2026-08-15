import {
  selectableVotingElectionObject,
  type SelectableVotingElection,
} from '@repo/votura-validators';
import axios from 'axios';
import useSWR from 'swr';
import { apiRoutes } from '../apiRoutes.ts';
import { toArraySchema } from '../toArraySchema.ts';
import type { ParametrizedApiHook } from '../types/ApiHook';
import { getVoterLocalStorage } from '../voterToken.ts';

export interface UseGetVoterElectionsParams {
  token?: string | null;
}

interface VoterElectionsKey {
  url: string;
  token: string | null;
}

export const useGetVoterElections: ParametrizedApiHook<
  UseGetVoterElectionsParams,
  SelectableVotingElection[]
> = ({ token }, options) => {
  const skipFetchByOption = options?.skipFetch ?? false;
  let tokenFromStorage: string | null = token ?? getVoterLocalStorage();

  if (tokenFromStorage === null || tokenFromStorage.trim() === '') {
    tokenFromStorage = null;
  }

  const shouldFetch = !skipFetchByOption && tokenFromStorage !== null;

  let key: VoterElectionsKey | null = null;
  if (shouldFetch) {
    key = {
      url: '/voting/getElections',
      token: tokenFromStorage,
    };
  } else {
    key = null;
  }
  return useSWR(key, async ({ url, token: requestToken }) => {
    const instance = axios.create({
      baseURL: apiRoutes.base,
    });

    const response = await instance.get(url, {
      headers: {
        // eslint-disable-next-line @typescript-eslint/naming-convention
        Accept: 'application/json',
        // eslint-disable-next-line @typescript-eslint/naming-convention
        Authorization: `Bearer ${requestToken}`,
      },
    });

    const parsed = await toArraySchema(selectableVotingElectionObject).safeParseAsync(
      response.data,
    );

    if (!parsed.success) {
      throw new TypeError('Parsing failed');
    }

    return parsed.data;
  });
};
