import type { SelectableVoterGroup } from '@repo/votura-validators';
import { z } from 'zod/v4';
import useSWRMutation, { type SWRMutationResponse } from 'swr/mutation';
import { apiRoutes } from '../apiRoutes.ts';
import { getterFactory } from '../getterFactory.ts';

const voterTokensSchema = z.array(z.string().min(1));

export interface UseCreateVoterTokensProps {
  voterGroupId: SelectableVoterGroup['id'];
}

export const useCreateVoterTokens = ({
                                       voterGroupId,
                                     }: UseCreateVoterTokensProps): SWRMutationResponse<string[], Error, string, undefined> => {
  return useSWRMutation(
    apiRoutes.voterGroups.createVoterTokens(voterGroupId),
    getterFactory(voterTokensSchema),
  );
};