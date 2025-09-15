import {
    type SelectableElection,
    selectableElectionObject,
} from '@repo/votura-validators';
import { mutate } from 'swr';
import useSWRMutation, { type SWRMutationResponse } from 'swr/mutation';
import { apiRoutes } from '../apiRoutes.ts';
import { putterFactory } from '../putterFactory.ts';

export const useFreezeElection = (
    electionId: SelectableElection['id'],
): SWRMutationResponse<SelectableElection, Error, string, undefined> => {
    return useSWRMutation(
        apiRoutes.elections.freeze(electionId),
        putterFactory(selectableElectionObject),
        {
            onSuccess: () => {
                void mutate(apiRoutes.elections.base);
            },
        },
    );
};
