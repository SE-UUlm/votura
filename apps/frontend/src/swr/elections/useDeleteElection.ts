import type { SelectableElection } from '@repo/votura-validators';
import { mutate } from 'swr';
import useSWRMutation, { type SWRMutationResponse } from 'swr/mutation';
import { apiRoutes } from '../apiRoutes.ts';
import { deleter } from '../deleter.ts';

export interface UseDeleteElectionProps {
  electionId: SelectableElection['id'];
}

export const useDeleteElection = ({
  electionId,
}: UseDeleteElectionProps): SWRMutationResponse<null, Error, string, undefined> => {
  return useSWRMutation(apiRoutes.elections.byId(electionId), deleter, {
    onSuccess: () => {
      void mutate(apiRoutes.elections.base);
    },
  });
};
