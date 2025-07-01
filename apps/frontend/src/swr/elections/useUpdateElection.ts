import {
  type SelectableElection,
  selectableElectionObject,
  type UpdateableElection,
} from '@repo/votura-validators';
import { mutate } from 'swr';
import useSWRMutation, { type SWRMutationResponse } from 'swr/mutation';
import { apiRoutes } from '../apiRoutes.ts';
import { putterFactory } from '../putterFactory.ts';

export const useUpdateElection = (
  electionId: SelectableElection['id'],
): SWRMutationResponse<SelectableElection, Error, string, UpdateableElection> => {
  return useSWRMutation(
    apiRoutes.elections.byId(electionId),
    putterFactory(selectableElectionObject),
    {
      onSuccess: () => {
        void mutate(apiRoutes.elections.base);
      },
    },
  );
};
