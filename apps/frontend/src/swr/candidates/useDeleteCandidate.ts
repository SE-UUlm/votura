import type { SelectableCandidate, SelectableElection } from '@repo/votura-validators';
import { mutate } from 'swr';
import useSWRMutation, { type SWRMutationResponse } from 'swr/mutation';
import { apiRoutes } from '../apiRoutes.ts';
import { deleter } from '../deleter.ts';

export const useDeleteCandidate = (
  electionId: SelectableElection['id'] | undefined,
  candidateId: SelectableCandidate['id'] | undefined,
): SWRMutationResponse<null, Error, string, undefined> => {
  const shouldFetch = electionId !== undefined && candidateId !== undefined;

  return useSWRMutation(
    shouldFetch ? apiRoutes.elections.candidates.byId(electionId, candidateId) : null,
    deleter,
    {
      onSuccess: () => {
        void mutate(apiRoutes.elections.candidates.base);
        void mutate(apiRoutes.elections.ballotPapers.ballotPaperSections.candidates.base);
      },
    },
  );
};
