import {
  type SelectableBallotPaper,
  selectableBallotPaperObject,
  type SelectableElection,
} from '@repo/votura-validators';
import { useEffect, useState } from 'react';
import { apiRoutes } from '../apiRoutes.ts';
import { getterFactory } from '../getterFactory.ts';
import { toArraySchema } from '../toArraySchema.ts';

/**
 * Fetches ballot papers for a list of elections and returns a mapping keyed by election id.
 * Reason: Calling hooks (e.g. useGetBallotPapers) inside loops or conditionally violates React's Rules of Hooks.
 * This hook performs a consolidated, hook-safe fetch for all elections, returning a Record<string, SelectableBallotPaper[]>.
 * @param elections Optional array of SelectableBallotPaper; when undefined or empty an empty record is returned
 * @returns Record<string, SelectableBallotPaper[]> mapping electionId => ballot papers array
 */
export const useGetBallotPapersByElections = (
  elections?: SelectableElection[],
): Record<string, SelectableBallotPaper[]> => {
  const [ballotPapersByElection, setBallotPapersByElection] = useState<
    Record<string, SelectableBallotPaper[]>
  >({});

  useEffect(() => {
    if (!elections || elections.length === 0) {
      setBallotPapersByElection({});
      return;
    }

    let cancelled = false;

    const fetchAllBallotPapers = async (): Promise<void> => {
      const getter = getterFactory(toArraySchema(selectableBallotPaperObject));
      const result: Record<string, SelectableBallotPaper[]> = {};

      await Promise.all(
        elections.map(async (election: SelectableElection) => {
          try {
            const url = apiRoutes.elections.ballotPapers.base(election.id);
            const ballotPapers = await getter(url);
            result[election.id] = ballotPapers ?? [];
          } catch {
            result[election.id] = [];
          }
        }),
      );

      if (!cancelled) setBallotPapersByElection(result);
    };

    void fetchAllBallotPapers();

    return (): void => {
      cancelled = true;
    };
    // to prevent infinite render loops
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [elections]);

  return ballotPapersByElection;
};
