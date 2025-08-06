import {
  type InsertableBallotPaperSection,
  type SelectableBallotPaper,
  type SelectableBallotPaperSection,
  selectableBallotPaperSectionObject,
  type SelectableElection,
} from '@repo/votura-validators';
import useSWRMutation, { type SWRMutationResponse } from 'swr/mutation';
import { apiRoutes } from '../apiRoutes.ts';
import { posterFactory } from '../posterFactory.ts';

export interface UseCreateBallotPaperSectionProps {
  electionId: SelectableElection['id'];
  ballotPaperId: SelectableBallotPaper['id'];
}

export const useCreateBallotPaperSection = ({
  electionId,
  ballotPaperId,
}: UseCreateBallotPaperSectionProps): SWRMutationResponse<
  SelectableBallotPaperSection,
  Error,
  string,
  InsertableBallotPaperSection
> => {
  const shouldFetch = electionId !== undefined && ballotPaperId !== undefined;

  return useSWRMutation(
    shouldFetch
      ? apiRoutes.elections.ballotPapers.ballotPaperSections.base(electionId, ballotPaperId)
      : null,
    posterFactory(selectableBallotPaperSectionObject),
  );
};
