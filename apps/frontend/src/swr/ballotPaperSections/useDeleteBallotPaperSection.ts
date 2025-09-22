import type {
  SelectableBallotPaper,
  SelectableBallotPaperSection,
  SelectableElection,
} from '@repo/votura-validators';
import { mutate } from 'swr';
import useSWRMutation, { type SWRMutationResponse } from 'swr/mutation';
import { apiRoutes } from '../apiRoutes.ts';
import { deleter } from '../deleter.ts';

export interface UseDeleteBallotPaperSectionProps {
  electionId: SelectableElection['id'];
  ballotPaperId: SelectableBallotPaper['id'];
  ballotPaperSectionId: SelectableBallotPaperSection['id'];
}

export const useDeleteBallotPaperSection = ({
  electionId,
  ballotPaperId,
  ballotPaperSectionId,
}: UseDeleteBallotPaperSectionProps): SWRMutationResponse<null, Error, string, undefined> => {
  const shouldFetch =
    electionId !== undefined && ballotPaperId !== undefined && ballotPaperSectionId !== undefined;

  return useSWRMutation(
    shouldFetch
      ? apiRoutes.elections.ballotPapers.ballotPaperSections.byId(
          electionId,
          ballotPaperId,
          ballotPaperSectionId,
        )
      : null,
    deleter,
    {
      onSuccess: () => {
        void mutate(
          apiRoutes.elections.ballotPapers.ballotPaperSections.base(electionId, ballotPaperId),
        );
      },
    },
  );
};
