import {
  type SelectableBallotPaper,
  type SelectableBallotPaperSection,
  selectableBallotPaperSectionObject,
  type SelectableElection,
  type UpdateableBallotPaperSection,
} from '@repo/votura-validators';
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

  return useSWRMutation(
    shouldFetch
      ? apiRoutes.elections.ballotPapers.ballotPaperSections.byId(
          electionId,
          ballotPaperId,
          ballotPaperSectionId,
        )
      : null,
    putterFactory(selectableBallotPaperSectionObject),
  );
};
