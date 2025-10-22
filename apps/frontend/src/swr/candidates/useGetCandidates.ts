import {
  type SelectableCandidate,
  selectableCandidateObject,
  type SelectableElection,
} from '@repo/votura-validators';
import useSWR, { type SWRResponse } from 'swr';
import { apiRoutes } from '../apiRoutes.ts';
import { getterFactory } from '../getterFactory.ts';
import { toArraySchema } from '../toArraySchema.ts';

export const useGetCandidates = (
  electionId: SelectableElection['id'] | undefined,
): SWRResponse<SelectableCandidate[], TypeError | undefined> => {
  const shouldFetch = electionId !== undefined;

  return useSWR(
    shouldFetch ? apiRoutes.elections.candidates.base(electionId) : null,
    getterFactory(toArraySchema(selectableCandidateObject)),
  );
};
