import type { NotificationData } from '@mantine/notifications';
import type { SelectableElection, SelectableElectionResult } from '@repo/votura-validators';
import { mutate } from 'swr';
import i18n from '../../i18n.ts';
import { apiRoutes } from '../../swr/apiRoutes.ts';
import {
  getPublishResultsSuccessElectionConfig,
  getRPCErrorConfig,
} from '../../utils/notifications.ts';
import { rpcRoutes } from '../rpcRoutes.ts';
import { type ApiErrorResponse, rpcViaHTTP } from '../rpcViaHTTP.ts';

export const callPublishElectionResults = async (
  electionId: SelectableElection['id'],
): Promise<NotificationData> => {
  const rpcResponse = await rpcViaHTTP(rpcRoutes.elections.publishResults(electionId), 'PUT');

  if (rpcResponse === null) {
    return getRPCErrorConfig(
      i18n.t(
        'anErrorHasOccurredWhilstAttemptingToPublishTheResultsPleaseTryAgainLater',
        'An error has occurred whilst attempting to publish the results. Please try again later.',
      ),
    );
  }

  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  const json = await rpcResponse.json();

  // Check whether the RPC call returned an error
  if (!rpcResponse.ok) {
    const error = json as ApiErrorResponse;
    return getRPCErrorConfig(error.message);
  }

  // Mutate election details in SWR cache to reflect the published results
  await mutate(apiRoutes.elections.base);
  await mutate(apiRoutes.elections.byId(electionId));

  const electionResult = json as SelectableElectionResult;
  return getPublishResultsSuccessElectionConfig(electionResult.name);
};
