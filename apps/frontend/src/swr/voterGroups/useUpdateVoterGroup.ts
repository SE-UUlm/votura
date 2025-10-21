import {
  type SelectableVoterGroup,
  selectableVoterGroupObject,
  type UpdateableVoterGroup,
} from '@repo/votura-validators';
import { mutate } from 'swr';
import useSWRMutation, { type SWRMutationResponse } from 'swr/mutation';
import { apiRoutes } from '../apiRoutes.ts';
import { putterFactory } from '../putterFactory.ts';

export const useUpdateVoterGroup = (
  voterGroupId: SelectableVoterGroup['id'],
): SWRMutationResponse<SelectableVoterGroup, Error, string, UpdateableVoterGroup> => {
  return useSWRMutation(
    apiRoutes.voterGroups.byId(voterGroupId),
    putterFactory(selectableVoterGroupObject),
    {
      onSuccess: () => {
        void mutate(apiRoutes.voterGroups.base);
      },
    },
  );
};
