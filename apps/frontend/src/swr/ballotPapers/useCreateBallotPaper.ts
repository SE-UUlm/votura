import {
  type InsertableBallotPaper,
  type SelectableBallotPaper,
  selectableBallotPaperObject,
  type SelectableElection,
} from '@repo/votura-validators';
import useSWRMutation, { type SWRMutationResponse } from 'swr/mutation';
import { apiRoutes } from '../apiRoutes.ts';
import { posterFactory } from '../posterFactory.ts';

export const useCreateBallotPaper = (
  electionId?: SelectableElection['id'],
): SWRMutationResponse<SelectableBallotPaper, Error, string, InsertableBallotPaper> => {
  const shouldFetch = electionId !== undefined;

  return useSWRMutation(
    shouldFetch ? apiRoutes.elections.ballotPapers.base(electionId) : null,
    posterFactory(selectableBallotPaperObject),
  );
};
