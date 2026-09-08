import type { FreezableElection, SelectableElection } from '@repo/votura-validators';
import { rpcRoutes } from '../rpcRoutes.ts';
import { rpcViaHTTP } from '../rpcViaHTTP.ts';

export const callGetElectionFreezable = async (
  electionId: SelectableElection['id'],
): Promise<boolean> => {
  const rpcResponse = await rpcViaHTTP(rpcRoutes.elections.freezable(electionId));

  if (rpcResponse === null) {
    return false;
  }

  // Check whether the RPC call returned an error
  if (!rpcResponse.ok) {
    return false;
  }

  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  const json = await rpcResponse.json();
  return (json as FreezableElection)?.freezable ?? false;
};
