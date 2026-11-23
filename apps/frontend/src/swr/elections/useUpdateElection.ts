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
        Promise.all([
          mutate(apiRoutes.elections.base),
          mutate(apiRoutes.elections.byId(electionId)),
        ]).catch((error) => {
          console.error('Failed to mutate elections', error);
        });
      },
    },
  );
};
