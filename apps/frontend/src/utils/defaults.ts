import type {SelectableElection, UpdateableElection} from '@repo/votura-validators';

export const getDefaultElection = (partial: Partial<SelectableElection>): UpdateableElection => {
  return {
    name: 'Default Election Name',
    votingStartAt: new Date().toISOString(),
    votingEndAt: new Date().toISOString(),
    configFrozen: false,
    allowInvalidVotes: false,
    private: true,
    ...partial,
  };
};
