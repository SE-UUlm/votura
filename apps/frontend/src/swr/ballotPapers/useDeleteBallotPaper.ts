import type {SelectableBallotPaper, SelectableElection} from '@repo/votura-validators';
import useSWRMutation, {type SWRMutationResponse} from 'swr/mutation';
import {apiRoutes} from '../apiRoutes.ts';
import {deleter} from '../deleter.ts';
import {mutate} from 'swr';

export interface UseDeleteBallotPaperProps {
    electionId: SelectableElection['id'];
    ballotPaperId: SelectableBallotPaper['id'];
}

export const useDeleteBallotPaper = ({
    electionId,
    ballotPaperId,
}: UseDeleteBallotPaperProps): SWRMutationResponse<null, Error, string, undefined> => {
    return useSWRMutation(
        apiRoutes.elections.ballotPapers.byId(electionId, ballotPaperId),
        deleter,
        {
            onSuccess: () => {
                void mutate(apiRoutes.elections.ballotPapers.base);
            }
        }
    )
}