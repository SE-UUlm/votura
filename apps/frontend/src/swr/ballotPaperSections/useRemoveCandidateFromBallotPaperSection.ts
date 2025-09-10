import type {
  SelectableBallotPaper,
  SelectableBallotPaperSection,
  SelectableCandidate,
  SelectableElection,
} from '@repo/votura-validators';
import { mutate } from 'swr';
import useSWRMutation, { type SWRMutationResponse } from 'swr/mutation';
import { apiRoutes } from '../apiRoutes.ts';
import { deleter } from '../deleter.ts';

export const useRemoveCandidateFromBallotPaperSection = (
  electionId?: SelectableElection['id'],
  ballotPaperId?: SelectableBallotPaper['id'],
  ballotPaperSectionId?: SelectableBallotPaperSection['id'],
): SWRMutationResponse<null, Error, string, { candidateId: SelectableCandidate['id'] }> => {
  const shouldFetch =
    electionId !== undefined && ballotPaperId !== undefined && ballotPaperSectionId !== undefined;

  return useSWRMutation(
    shouldFetch
      ? apiRoutes.elections.ballotPapers.ballotPaperSections.candidates.base(
          electionId,
          ballotPaperId,
          ballotPaperSectionId,
        )
      : null,
    deleter,
    {
      onSuccess: () => {
        if (electionId !== undefined && ballotPaperId !== undefined) {
          void mutate(
            apiRoutes.elections.ballotPapers.ballotPaperSections.base(electionId, ballotPaperId),
          );
        }
      },
    },
  );
};
