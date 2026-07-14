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

  let ballotPaperSection = null;
  if (shouldFetch) {
    ballotPaperSection = apiRoutes.elections.ballotPapers.ballotPaperSections.byId(
        electionId,
        ballotPaperId,
        ballotPaperSectionId,
    );
  }

  return useSWRMutation(
    ballotPaperSection,
    deleter,
    {
      onSuccess: () => {
        mutate(
          apiRoutes.elections.ballotPapers.ballotPaperSections.base(electionId, ballotPaperId),
        ).catch((error) => {
          console.error('Failed to mutate ballot paper sections', error);
        });
      },
    },
  );
};
