import type { NotificationData } from '@mantine/notifications';
import type { SelectableElection } from '@repo/votura-validators';
import { getElectionNotFreezableConfig } from '../../utils/notifications.ts';
import { callFreezeElection } from './callFreezeElection.ts';
import { callGetElectionFreezable } from './callGetElectionFreezable.ts';
import { callUnfreezeElection } from './callUnfreezeElection.ts';

export const callToggleElectionFreeze = async (
  election: SelectableElection,
): Promise<NotificationData> => {
  if (election.configFrozen) {
    return callUnfreezeElection(election.id);
  }

  const freezable = await callGetElectionFreezable(election.id);
  if (!freezable) {
    return getElectionNotFreezableConfig(election.name);
  }

  return callFreezeElection(election.id);
};
