import {
  type SelectableCandidate,
  selectableCandidateObject,
  type SelectableElection,
  type UpdateableCandidate,
} from '@repo/votura-validators';
import { mutate } from 'swr';
import useSWRMutation, { type SWRMutationResponse } from 'swr/mutation';
import { apiRoutes } from '../apiRoutes.ts';
import { putterFactory } from '../putterFactory.ts';

export const useUpdateCandidate = (
  electionId: SelectableElection['id'] | undefined,
  candidateId: SelectableCandidate['id'] | undefined,
): SWRMutationResponse<SelectableCandidate, Error, string, UpdateableCandidate> => {
  const shouldFetch = electionId !== undefined && candidateId !== undefined;

  return useSWRMutation(
    shouldFetch ? apiRoutes.elections.candidates.byId(electionId, candidateId) : null,
    putterFactory(selectableCandidateObject),
    {
      onSuccess: () => {
        void mutate(apiRoutes.elections.candidates.base);
        void mutate(apiRoutes.elections.ballotPapers.ballotPaperSections.candidates.base);
      },
    },
  );
};
