import useSWR from 'swr';
import { fetcher } from './fetcher.ts';

interface UseVoturaGithubRepoResponse {
  subscribers_count: number;
  stargazers_count: number;
  forks_count: number;
}

export const useVoturaGithubRepo = () => {
  return useSWR(
    `https://api.github.com/repos/SE-UUlm/votura`,
    fetcher<UseVoturaGithubRepoResponse>,
  );
};
