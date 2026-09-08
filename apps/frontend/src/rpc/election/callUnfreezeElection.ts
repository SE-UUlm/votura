import type { NotificationData } from '@mantine/notifications';
import type { SelectableElection } from '@repo/votura-validators';
import { mutate } from 'swr';
import { apiRoutes } from '../../swr/apiRoutes.ts';
import {
  getRPCErrorConfig,
  getToggleFreezeSuccessElectionConfig,
} from '../../utils/notifications.ts';
import { rpcRoutes } from '../rpcRoutes.ts';
import { type ApiErrorResponse, rpcViaHTTP } from '../rpcViaHTTP.ts';

export const callUnfreezeElection = async (
  electionId: SelectableElection['id'],
): Promise<NotificationData> => {
  const rpcResponse = await rpcViaHTTP(rpcRoutes.elections.unfreeze(electionId), 'PUT');

  if (rpcResponse === null) {
    return getRPCErrorConfig(
      'An error has occurred whilst attempting to unfreeze the election. Please try again later.',
    );
  }

  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  const json = await rpcResponse.json();

  // Check whether the RPC call returned an error
  if (!rpcResponse.ok) {
    const error = json as ApiErrorResponse;
    return getRPCErrorConfig(error.message);
  }

  // Check whether the election's frozen state has actually changed
  const election = json as SelectableElection;
  if (election.configFrozen) {
    return getRPCErrorConfig(
      'An error has occurred whilst attempting to unfreeze the election. Please try again later.',
    );
  }

  // Mutate election details in SWR cache to reflect the unfrozen state
  await mutate(apiRoutes.elections.base);
  await mutate(apiRoutes.elections.byId(electionId));

  return getToggleFreezeSuccessElectionConfig(election.name, election.configFrozen);
};
