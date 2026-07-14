import {
  type SelectableBallotPaper,
  type SelectableBallotPaperSection,
  selectableBallotPaperSectionObject,
  type SelectableElection,
  type UpdateableBallotPaperSection,
} from '@repo/votura-validators';
import { mutate } from 'swr';
import useSWRMutation, { type SWRMutationResponse } from 'swr/mutation';
import { apiRoutes } from '../apiRoutes.ts';
import { putterFactory } from '../putterFactory.ts';

export interface UseUpdateBallotPaperSectionProps {
  electionId: SelectableElection['id'];
  ballotPaperId: SelectableBallotPaper['id'];
  ballotPaperSectionId: SelectableBallotPaperSection['id'];
}

export const useUpdateBallotPaperSection = ({
  electionId,
  ballotPaperId,
  ballotPaperSectionId,
}: UseUpdateBallotPaperSectionProps): SWRMutationResponse<
  SelectableBallotPaperSection,
  Error,
  string,
  UpdateableBallotPaperSection
> => {
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
    putterFactory(selectableBallotPaperSectionObject),
    {
      onSuccess: () => {
        void mutate(
          apiRoutes.elections.ballotPapers.ballotPaperSections.base(electionId, ballotPaperId),
        );
      },
    },
  );
};
