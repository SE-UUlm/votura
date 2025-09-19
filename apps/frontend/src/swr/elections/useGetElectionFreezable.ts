import {
  type FreezableElection,
  freezableElectionObject,
  type SelectableElection,
} from '@repo/votura-validators';
import useSWR, { type SWRResponse } from 'swr';
import { apiRoutes } from '../apiRoutes.ts';
import { getterFactory } from '../getterFactory.ts';

export const useGetElectionFreezable = (
  electionId: SelectableElection['id'],
): SWRResponse<FreezableElection, TypeError | undefined> => {
  return useSWR(apiRoutes.elections.freezable(electionId), getterFactory(freezableElectionObject));
};
