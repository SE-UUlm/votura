import {
  type SelectableBallotPaper,
  type SelectableBallotPaperSection,
  selectableBallotPaperSectionObject,
  type SelectableCandidate,
  type SelectableElection,
  type updateableCandidateOperationOptions,
} from '@repo/votura-validators';
import { mutate } from 'swr';
import useSWRMutation, { type SWRMutationResponse } from 'swr/mutation';
import { apiRoutes } from '../apiRoutes.ts';
import { putterFactory } from '../putterFactory.ts';

export const useUpdateCandidateInBallotPaperSection = (
  electionId?: SelectableElection['id'],
  ballotPaperId?: SelectableBallotPaper['id'],
  ballotPaperSectionId?: SelectableBallotPaperSection['id'],
): SWRMutationResponse<
  SelectableBallotPaperSection,
  Error,
  string,
  {
    candidateId: SelectableCandidate['id'];
    operation: keyof typeof updateableCandidateOperationOptions;
  }
> => {
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
    putterFactory(selectableBallotPaperSectionObject),
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
