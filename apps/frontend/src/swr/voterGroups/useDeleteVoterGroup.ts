import type { SelectableVoterGroup } from '@repo/votura-validators';
import { mutate } from 'swr';
import useSWRMutation, { type SWRMutationResponse } from 'swr/mutation';
import { apiRoutes } from '../apiRoutes.ts';
import { deleter } from '../deleter.ts';

export interface UseDeleteVoterGroupProps {
  voterGroupId: SelectableVoterGroup['id'];
}

export const useDeleteVoterGroup = ({
  voterGroupId,
}: UseDeleteVoterGroupProps): SWRMutationResponse<null, Error, string, undefined> => {
  return useSWRMutation(apiRoutes.voterGroups.byId(voterGroupId), deleter, {
    onSuccess: () => {
      void mutate(apiRoutes.voterGroups.base);
    },
  });
};
