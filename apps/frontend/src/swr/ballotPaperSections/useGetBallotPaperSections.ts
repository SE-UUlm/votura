import {
  type SelectableBallotPaper,
  type SelectableBallotPaperSection,
  selectableBallotPaperSectionObject,
  type SelectableElection,
} from '@repo/votura-validators';
import useSWR, { type SWRResponse } from 'swr';
import { apiRoutes } from '../apiRoutes.ts';
import { getterFactory } from '../getterFactory.ts';
import { toArraySchema } from '../toArraySchema.ts';

export const useGetBallotPaperSections = (
  electionId?: SelectableElection['id'],
  ballotPaperId?: SelectableBallotPaper['id'],
): SWRResponse<SelectableBallotPaperSection[], TypeError | undefined> => {
  const shouldFetch = electionId !== undefined && ballotPaperId !== undefined;

  return useSWR(
    shouldFetch
      ? apiRoutes.elections.ballotPapers.ballotPaperSections.base(electionId, ballotPaperId)
      : null,
    getterFactory(toArraySchema(selectableBallotPaperSectionObject)),
  );
};
