import {type InsertableElection, type SelectableElection, selectableElectionObject} from '@repo/votura-validators';
import useSWRMutation, { type SWRMutationResponse } from 'swr/mutation';
import { apiRoutes } from '../apiRoutes.ts';
import {posterFactory} from '../posterFactory.ts';

export const useCreateElection = (): SWRMutationResponse<
  SelectableElection,
  Error,
  string,
  InsertableElection
> => {
  return useSWRMutation(apiRoutes.elections.base, posterFactory(selectableElectionObject));
};
