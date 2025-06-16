import useSWR, { type SWRResponse } from 'swr';
import { fetcher } from './fetcher.ts';

interface UseVoturaGithubRepoResponse {
  subscribers_count: number;
  stargazers_count: number;
  forks_count: number;
}

export const useVoturaGithubRepo = (): SWRResponse<UseVoturaGithubRepoResponse> => {
  return useSWR<unknown>(
    `https://api.github.com/repos/SE-UUlm/votura`,
    fetcher,
  ) as SWRResponse<UseVoturaGithubRepoResponse>;
};
