import {
  type SelectableBallotPaper,
  selectableBallotPaperObject,
  type SelectableElection,
  type UpdateableBallotPaper,
} from '@repo/votura-validators';
import { mutate } from 'swr';
import useSWRMutation, { type SWRMutationResponse } from 'swr/mutation';
import { apiRoutes } from '../apiRoutes.ts';
import { putterFactory } from '../putterFactory.ts';

export interface UseUpdateBallotPaperProps {
  electionId: SelectableElection['id'];
  ballotPaperId: SelectableBallotPaper['id'];
}

export const useUpdateBallotPaper = ({
  electionId,
  ballotPaperId,
}: UseUpdateBallotPaperProps): SWRMutationResponse<
  SelectableBallotPaper,
  Error,
  string,
  UpdateableBallotPaper
> => {
  return useSWRMutation(
    apiRoutes.elections.ballotPapers.byId(electionId, ballotPaperId),
    putterFactory(selectableBallotPaperObject),
    {
      onSuccess: () => {
        void mutate(apiRoutes.elections.ballotPapers.base);
      },
    },
  );
};
