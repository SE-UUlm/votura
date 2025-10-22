import {
  type SelectableBallotPaper,
  selectableBallotPaperObject,
  type SelectableElection,
} from '@repo/votura-validators';
import useSWR, { type SWRResponse } from 'swr';
import { apiRoutes } from '../apiRoutes.ts';
import { getterFactory } from '../getterFactory.ts';
import { toArraySchema } from '../toArraySchema.ts';

export const useGetBallotPapers = (
  electionId?: SelectableElection['id'],
): SWRResponse<SelectableBallotPaper[], TypeError | undefined> => {
  const shouldFetch = electionId !== undefined;

  return useSWR(
    shouldFetch ? apiRoutes.elections.ballotPapers.base(electionId) : null,
    getterFactory(toArraySchema(selectableBallotPaperObject)),
  );
};
