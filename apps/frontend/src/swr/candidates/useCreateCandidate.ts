import {
  type InsertableCandidate,
  type SelectableCandidate,
  selectableCandidateObject,
  type SelectableElection,
} from '@repo/votura-validators';
import useSWRMutation, { type SWRMutationResponse } from 'swr/mutation';
import { apiRoutes } from '../apiRoutes.ts';
import { posterFactory } from '../posterFactory.ts';

export const useCreateCandidate = (
  electionId?: SelectableElection['id'],
): SWRMutationResponse<SelectableCandidate, Error, string, InsertableCandidate> => {
  const shouldFetch = electionId !== undefined;

  return useSWRMutation(
    shouldFetch ? apiRoutes.elections.candidates.base(electionId) : null,
    posterFactory(selectableCandidateObject),
  );
};
