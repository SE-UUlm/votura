import type { SelectableElection, UpdateableElection } from '@repo/votura-validators';
import i18next from 'i18next';


export const getDefaultElection = (partial: Partial<SelectableElection>): UpdateableElection => {
  return {
    name: i18next.t('defaultElectionName', 'Default Election Name'),
    votingStartAt: new Date().toISOString(),
    votingEndAt: new Date().toISOString(),
    configFrozen: false,
    allowInvalidVotes: false,
    private: true,
    ...partial,
  };
};
