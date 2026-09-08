import {
  type InsertableVoterGroup,
  type SelectableVoterGroup,
  selectableVoterGroupObject,
} from '@repo/votura-validators';
import useSWRMutation, { type SWRMutationResponse } from 'swr/mutation';
import { apiRoutes } from '../apiRoutes.ts';
import { posterFactory } from '../posterFactory.ts';

export const useCreateVoterGroup = (): SWRMutationResponse<
  SelectableVoterGroup,
  Error,
  string,
  InsertableVoterGroup
> => {
  return useSWRMutation(apiRoutes.voterGroups.base, posterFactory(selectableVoterGroupObject));
};
